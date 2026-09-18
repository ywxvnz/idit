import { useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { jsPDF } from 'jspdf';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_MARGIN_MM = 5;
const PHOTO_SIZES_MM = {
  '1x1': { width: 25.4, height: 25.4 },
  '2x2': { width: 50.8, height: 50.8 },
  '1.5x1.5': { width: 38.1, height: 38.1 },
  passport: { width: 35, height: 45 },
};

function getLayoutRows(template) {
  return template.layout.map((row) => ({
    ...row,
    ...PHOTO_SIZES_MM[row.size],
    rowWidth: PHOTO_SIZES_MM[row.size].width * row.count,
  }));
}

function objectUrlToDataUrl(src) {
  return fetch(src)
    .then((response) => response.blob())
    .then((blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));
}

function NametagOverlay({
  enabled,
  blank,
  text,
  height,
  fontSize,
  photoSize,
  bold,
  italic,
  onMeasuredHeight,
  cropBounds,
}) {
  const photoHeightInches = photoSize === 'passport' ? 1.77 : 1;
  const heightPercent = Math.min((height / photoHeightInches) * 100, 60);
  const overlayRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (!overlayRef.current || !textRef.current || !text || blank || !onMeasuredHeight) {
      return undefined;
    }

    const reportHeight = () => {
      const photoHeight = cropBounds?.height || 270;
      const photoWidth = cropBounds?.width || (photoSize === 'passport' ? 210 : 270);
      const photoHeightInchesForPreview = photoSize === 'passport' ? 1.77 : 1;
      const marginRatio = photoSize === 'passport' ? 0.0073 : 0.01;
      const margin = photoWidth * marginRatio;
      const contentHeight = textRef.current.scrollHeight;
      const requiredHeight = ((contentHeight + margin * 2) / photoHeight) * photoHeightInchesForPreview;
      const nextHeight = Math.min(1, Math.max(0.1, Number(requiredHeight.toFixed(2))));
      if (nextHeight > height + 0.01) onMeasuredHeight(nextHeight);
    };

    reportHeight();
    const observer = new ResizeObserver(reportHeight);
    observer.observe(overlayRef.current);
    return () => observer.disconnect();
  }, [fontSize, bold, italic, text, blank, height, photoHeightInches, photoSize, cropBounds, onMeasuredHeight]);

  if (!enabled) return null;

  const cropTagHeight = cropBounds
    ? Math.min(
      cropBounds.height,
      Math.max(1, (height / photoHeightInches) * cropBounds.height),
    )
    : null;

  return (
    <div
      ref={overlayRef}
      className={`nametag-overlay ${photoSize}`}
      style={{
        minHeight: `${heightPercent}%`,
        ...(cropBounds
          ? {
            top: cropBounds.top + cropBounds.height - cropTagHeight,
            left: cropBounds.left,
            width: cropBounds.width,
            height: cropTagHeight,
            minHeight: 0,
            padding: `${cropBounds.width * (photoSize === 'passport' ? 0.0073 : 0.01)}px`,
            bottom: 'auto',
            transform: 'none',
          }
          : {}),
      }}
    >
      {!blank && (
        <span
          ref={textRef}
          className="nametag-text"
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: bold ? 700 : 400,
            fontStyle: italic ? 'italic' : 'normal',
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
}

function PreviewPanel({
  printMode,
  template,
  uploads,
  uploadError,
  onUpload,
  photoSize,
  photo,
  photoError,
  cropMode,
  onPhotoFile,
  onCropDone,
  onPhotoEdit,
  onPhotoDelete,
  crop,
  zoom,
  rotation,
  flipHorizontal,
  onCropChange,
  onZoomChange,
  onRotationChange,
  onRotationStep,
  onFlipHorizontal,
  onReset,
  onCropComplete,
  nametagEnabled,
  nametagBlank,
  nametagText,
  nametagHeight,
  nametagFontSize,
  nametagBold,
  nametagItalic,
  onNametagMeasuredHeight,
}) {
  const inputRef = useRef(null);
  const uploadSlotRef = useRef(null);
  const cropEditorRef = useRef(null);
  const [cropBounds, setCropBounds] = useState(null);
  const [generatedTemplateKey, setGeneratedTemplateKey] = useState('');
  const rotationRadians = (Math.abs(rotation % 90) * Math.PI) / 180;
  const minimumZoom = 1 + Math.sin(rotationRadians) * (photoSize === 'passport' ? 0.8 : 0.42);
  const hasTemplate = Boolean(template);
  const hasAllTemplateUploads = hasTemplate
    && template.slots.every((slot) => uploads.some((upload) => upload.slot === slot));
  const generationKey = hasAllTemplateUploads
    ? `${template.id}:${template.slots.map((slot) => uploads.find((upload) => upload.slot === slot).id).join('|')}`
    : '';
  const layoutRows = hasTemplate ? getLayoutRows(template) : [];
  const layoutHeight = layoutRows.reduce((total, row) => total + row.height, 0);

  useEffect(() => {
    if (!printMode || !hasAllTemplateUploads) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setGeneratedTemplateKey(generationKey);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [printMode, hasAllTemplateUploads, generationKey]);

  useEffect(() => {
    if (printMode || !cropMode || !cropEditorRef.current) {
      setCropBounds(null);
      return undefined;
    }

    const editor = cropEditorRef.current;
    let cropArea = null;
    let animationFrame = null;

    const updateCropBounds = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const nextCropArea = editor.querySelector('.reactEasyCrop_CropArea');
        if (!nextCropArea) return;

        if (nextCropArea !== cropArea) {
          cropArea = nextCropArea;
          resizeObserver.observe(cropArea);
        }

        const editorRect = editor.getBoundingClientRect();
        const cropRect = cropArea.getBoundingClientRect();
        const nextBounds = {
          left: cropRect.left - editorRect.left,
          top: cropRect.top - editorRect.top,
          width: cropRect.width,
          height: cropRect.height,
        };

        setCropBounds((currentBounds) => (
          currentBounds
          && Math.abs(currentBounds.left - nextBounds.left) < 0.5
          && Math.abs(currentBounds.top - nextBounds.top) < 0.5
          && Math.abs(currentBounds.width - nextBounds.width) < 0.5
          && Math.abs(currentBounds.height - nextBounds.height) < 0.5
            ? currentBounds
            : nextBounds
        ));
      });
    };

    const observer = new ResizeObserver(updateCropBounds);
    const resizeObserver = observer;
    const mutationObserver = new MutationObserver(updateCropBounds);
    resizeObserver.observe(editor);
    mutationObserver.observe(editor, { childList: true, subtree: true });
    updateCropBounds();
    window.addEventListener('resize', updateCropBounds);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', updateCropBounds);
    };
  }, [cropMode, photoSize, photo?.src]);

  if (!printMode) {
    return (
      <div className="preview-panel">
        <input
          ref={inputRef}
          className="hidden-file-input"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onPhotoFile(file);
            event.target.value = '';
          }}
        />

        {!photo && !photoSize && (
          <p className="upload-prompt">Choose a photo size to upload a picture.</p>
        )}

        {!photo && photoSize && (
          <button className="upload-button" type="button" onClick={() => inputRef.current?.click()}>
            Upload picture
          </button>
        )}

        {photoError && <p className="upload-error">{photoError}</p>}

        {photo && cropMode && (
          <div className="crop-stage">
            <div ref={cropEditorRef} className={`crop-editor ${photoSize}`}>
              <Cropper
                image={photo.src}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                transform={`translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${flipHorizontal ? -zoom : zoom}, ${zoom})`}
                aspect={photoSize === 'passport' ? 35 / 45 : 1}
                minZoom={minimumZoom}
                restrictPosition
                showGrid
                style={{
                  cropAreaStyle: {
                    border: '2px solid #fff',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.58)',
                  },
                }}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onRotationChange={onRotationChange}
                onCropComplete={onCropComplete}
              />
              <NametagOverlay
                enabled={nametagEnabled}
                blank={nametagBlank}
                text={nametagText}
                height={nametagHeight}
                fontSize={nametagFontSize}
                bold={nametagBold}
                italic={nametagItalic}
                onMeasuredHeight={onNametagMeasuredHeight}
                cropBounds={cropBounds}
                photoSize={photoSize}
              />
            </div>
            <div className="crop-controls">
              <label className="zoom-control">
                <span>Zoom <output>{zoom.toFixed(2)}x</output></span>
                <input
                  type="range"
                  min={minimumZoom}
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(event) => onZoomChange(Number(event.target.value))}
                />
              </label>
              <div className="transform-controls" aria-label="Photo transforms">
                <div className="transform-group">
                  <span>Rotate</span>
                  <div className="transform-button-row">
                    <button
                      className="icon-button"
                      type="button"
                      aria-label="Rotate left"
                      title="Rotate left"
                      onClick={() => onRotationStep(-90)}
                    >
                      ↶
                    </button>
                    <button
                      className="icon-button"
                      type="button"
                      aria-label="Rotate right"
                      title="Rotate right"
                      onClick={() => onRotationStep(90)}
                    >
                      ↷
                    </button>
                  </div>
                </div>
                <div className="transform-group">
                  <span>Flip</span>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Flip horizontally"
                    title="Flip horizontally"
                    onClick={onFlipHorizontal}
                  >
                    ⇋
                  </button>
                </div>
                <div className="transform-group reset-group">
                  <span>Reset</span>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Reset photo edits"
                    title="Reset photo edits"
                    onClick={onReset}
                  >
                    ↺
                  </button>
                </div>
              </div>
            </div>
            <div className="preview-actions">
              <button className="preview-action-button" type="button" onClick={onCropDone}>
                Done
              </button>
              <button className="preview-action-button" type="button" onClick={onPhotoDelete}>
                Delete
              </button>
            </div>
          </div>
        )}

        {photo && !cropMode && (
          <div className="final-photo-stage">
            <div className={`final-photo-frame ${photoSize}`}>
              <img className="final-photo" src={photo.src} alt="Edited preview" />
              <NametagOverlay
                enabled={nametagEnabled}
                blank={nametagBlank}
                text={nametagText}
                height={nametagHeight}
                fontSize={nametagFontSize}
                bold={nametagBold}
                italic={nametagItalic}
                onMeasuredHeight={onNametagMeasuredHeight}
                photoSize={photoSize}
              />
            </div>
            <div className="preview-actions">
              <button className="preview-action-button" type="button" onClick={onPhotoEdit}>
                Edit
              </button>
              <button className="preview-action-button" type="button" onClick={onPhotoDelete}>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const slotLabels = {
    square: '1x1 / 2x2 / 1.5x1.5',
    passport: 'Passport (35x45 mm)',
  };
  const isTemplateGenerated = Boolean(generationKey) && generatedTemplateKey === generationKey;
  const isGeneratingTemplate = hasAllTemplateUploads && !isTemplateGenerated;

  async function handlePrintDownload() {
    if (!isTemplateGenerated) return;

    const imageData = new Map();
    await Promise.all(uploads.map(async (upload) => {
      imageData.set(upload.slot, await objectUrlToDataUrl(upload.src));
    }));

    const document = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    let y = A4_MARGIN_MM;

    layoutRows.forEach((row) => {
      const x = (A4_WIDTH_MM - row.rowWidth) / 2;
      const image = imageData.get(row.slot);

      for (let index = 0; index < row.count; index += 1) {
        const photoX = x + index * row.width;
        document.addImage(image, photoX, y, row.width, row.height);
        document.setDrawColor(0, 0, 0);
        document.setLineWidth(0.1);
        document.rect(photoX, y, row.width, row.height);
      }

      y += row.height;
    });

    document.save(`idit-${template.id}-a4.pdf`);
  }

  return (
    <div className="preview-panel">
      <input
        ref={inputRef}
        className="hidden-file-input"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && uploadSlotRef.current) onUpload(file, uploadSlotRef.current);
          event.target.value = '';
        }}
      />

      {!hasTemplate && (
        <p className="upload-prompt">Choose a template to upload a photo/s.</p>
      )}

      {hasTemplate && (
        <div className="print-upload-list">
          <div className="print-upload-statuses" aria-label="Uploaded photo sizes">
            {uploads.map((upload) => (
              <span className="print-upload-status" key={upload.id}>
                {slotLabels[upload.slot]} <span aria-label="Uploaded">✓</span>
              </span>
            ))}
          </div>

          {isGeneratingTemplate && (
            <p className="template-generating" role="status">Template is generating...</p>
          )}

          {isTemplateGenerated && (
            <div className="generated-template-output">
              <div className="generated-template-preview" aria-label="Generated A4 template preview">
                <div className="generated-template-paper">
                  {layoutRows.map((row, rowIndex) => {
                    const upload = uploads.find((currentUpload) => currentUpload.slot === row.slot);
                    const rowWidthPercent = (row.rowWidth / (A4_WIDTH_MM - A4_MARGIN_MM * 2)) * 100;
                    const rowHeightPercent = (row.height / (A4_HEIGHT_MM - A4_MARGIN_MM * 2)) * 100;

                    return (
                      <div
                        className="generated-template-row"
                        key={`${row.size}-${rowIndex}`}
                        style={{ height: `${rowHeightPercent}%` }}
                      >
                        <div className="generated-template-cells" style={{ width: `${rowWidthPercent}%` }}>
                          {Array.from({ length: row.count }, (_, index) => (
                            <div
                              className={`generated-template-cell ${row.slot}`}
                              key={`${row.size}-${index}`}
                              style={{ aspectRatio: `${row.width} / ${row.height}` }}
                            >
                              <img src={upload.src} alt={`${row.size} template photo ${index + 1}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="generated-template-caption">A4 / 5 mm margins / {layoutHeight.toFixed(1)} mm used</p>
              <button className="preview-action-button" type="button" onClick={handlePrintDownload}>
                Download PDF
              </button>
            </div>
          )}

          {!isTemplateGenerated && template.slots.map((slot) => {
            const upload = uploads.find((currentUpload) => currentUpload.slot === slot);

            return (
              <div className="print-upload-row" key={slot}>
                <div className="print-upload-heading">
                  <strong>{slotLabels[slot]}</strong>
                  {upload && <span className="print-upload-check" aria-label="Uploaded">✓</span>}
                </div>
                {upload ? (
                  <div className="print-upload-actions">
                    <img className="print-upload-thumbnail" src={upload.src} alt={`${slotLabels[slot]} uploaded`} />
                    <button
                      className="upload-button"
                      type="button"
                      onClick={() => {
                        uploadSlotRef.current = slot;
                        inputRef.current?.click();
                      }}
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <button
                    className="upload-button"
                    type="button"
                    onClick={() => {
                      uploadSlotRef.current = slot;
                      inputRef.current?.click();
                    }}
                  >
                    Upload picture
                  </button>
                )}
              </div>
            );
          })}

          {uploadError && <p className="upload-error">{uploadError}</p>}
        </div>
      )}
    </div>
  );
}

export default PreviewPanel;
