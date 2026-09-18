import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EditorTabs from '../components/EditorTabs';
import PreviewPanel from '../components/PreviewPanel';
import PhotoEditingPanel from '../components/PhotoEditingPanel';
import PrintLayoutPanel from '../components/PrintLayoutPanel';
import { getTemplate } from '../data/templates';
import heic2any from 'heic2any';

function Editor() {
  const [activeTab, setActiveTab] = useState('photo');
  const [activeNavLink, setActiveNavLink] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [printUploadError, setPrintUploadError] = useState('');
  const [photoSize, setPhotoSize] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [cropMode, setCropMode] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [cropAreaPixels, setCropAreaPixels] = useState(null);
  const [nametagEnabled, setNametagEnabled] = useState(false);
  const [nametagBlank, setNametagBlank] = useState(false);
  const [nametagText, setNametagText] = useState('');
  const [nametagHeight, setNametagHeight] = useState(0.1);
  const [nametagFontSize, setNametagFontSize] = useState(16);
  const [nametagBold, setNametagBold] = useState(false);
  const [nametagItalic, setNametagItalic] = useState(false);

  const selectedTemplate = getTemplate(selectedTemplateId);

  function handleTemplateChange(templateId) {
    setSelectedTemplateId(templateId);
    setPrintUploadError('');
  }

  function handleUpload(file, slot) {
    const image = new Image();
    image.onload = () => {
      const ratio = image.width / image.height;
      const expectedRatio = slot === 'passport' ? 35 / 45 : 1;
      const isCorrect = Math.abs(ratio - expectedRatio) < (slot === 'passport' ? 0.04 : 0.03);

      if (!isCorrect) {
        setPrintUploadError(
          `The uploaded ${slot === 'passport' ? 'passport' : 'square'} picture is not the right size/ratio. Please edit it first.`,
        );
        return;
      }

      setPrintUploadError('');
      setUploads((currentUploads) => [
        ...currentUploads.filter((upload) => upload.slot !== slot),
        {
          id: `${slot}-${file.name}-${file.lastModified}`,
          src: URL.createObjectURL(file),
          slot,
        },
      ]);
    };
    image.src = URL.createObjectURL(file);
  }

  async function handlePhotoFile(file) {
    setPhotoError('');
    let imageFile = file;

    if (file.type === 'image/heic' || file.type === 'image/heif' || /\.(heic|heif)$/i.test(file.name)) {
      try {
        const converted = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.92,
        });
        imageFile = Array.isArray(converted) ? converted[0] : converted;
      } catch {
        setPhotoError('This photo format could not be converted. Please choose a JPG or PNG photo.');
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhoto({ src: reader.result, file: imageFile });
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setFlipHorizontal(false);
        setCropAreaPixels(null);
        setNametagEnabled(false);
        setNametagBlank(false);
        setNametagText('');
        setNametagHeight(0.1);
        setNametagFontSize(16);
        setNametagBold(false);
        setNametagItalic(false);
        setCropMode(true);
      }
    };
    reader.onerror = () => {
      setPhotoError('This photo could not be loaded. Please choose a JPG or PNG photo.');
    };
    reader.readAsDataURL(imageFile);
  }

  function handlePhotoDelete() {
    setPhoto(null);
    setCropMode(false);
    setPhotoError('');
    setCropAreaPixels(null);
  }

  function handlePhotoSizeChange(size) {
    setPhotoSize(size);
    if (photo) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFlipHorizontal(false);
      setCropMode(true);
    }
  }

  function handleRotationChange(value) {
    setRotation(value);
    const rotationRadians = (Math.abs(value % 90) * Math.PI) / 180;
    const minimumZoom = 1 + Math.sin(rotationRadians) * (photoSize === 'passport' ? 0.8 : 0.42);
    setZoom((currentZoom) => Math.max(currentZoom, minimumZoom));
  }

  function handleRotationStep(amount) {
    handleRotationChange(rotation + amount);
  }

  function handlePhotoReset() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipHorizontal(false);
    setCropAreaPixels(null);
  }

  function handlePhotoCropDone() {
    if (!photo) return;

    const image = new Image();
    image.onload = () => {
      const cropWidth = cropAreaPixels?.width || image.width;
      const cropHeight = cropAreaPixels?.height || image.height;
      const cropX = cropAreaPixels?.x || 0;
      const cropY = cropAreaPixels?.y || 0;

      const rotationRadians = (rotation * Math.PI) / 180;
      const rotatedWidth = Math.abs(Math.cos(rotationRadians) * image.width)
        + Math.abs(Math.sin(rotationRadians) * image.height);
      const rotatedHeight = Math.abs(Math.sin(rotationRadians) * image.width)
        + Math.abs(Math.cos(rotationRadians) * image.height);
      const transformedCanvas = document.createElement('canvas');
      transformedCanvas.width = Math.round(rotatedWidth);
      transformedCanvas.height = Math.round(rotatedHeight);
      const transformedContext = transformedCanvas.getContext('2d');

      transformedContext.translate(transformedCanvas.width / 2, transformedCanvas.height / 2);
      transformedContext.rotate(rotationRadians);
      transformedContext.scale(flipHorizontal ? -1 : 1, 1);
      transformedContext.translate(-image.width / 2, -image.height / 2);
      transformedContext.drawImage(image, 0, 0);

      const canvas = document.createElement('canvas');
      canvas.width = photoSize === 'passport' ? 350 : 600;
      canvas.height = Math.round(canvas.width * (cropHeight / cropWidth));
      canvas.getContext('2d').drawImage(
        transformedCanvas,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      setPhoto((currentPhoto) => ({
        ...currentPhoto,
        src: canvas.toDataURL('image/jpeg', 0.92),
      }));
      setCropMode(false);
    };
    image.src = photo.src;
  }

  function handlePhotoDownload() {
    if (!photo || cropMode || !photoSize) return;

    const image = new Image();
    image.onload = () => {
      const isPassport = photoSize === 'passport';
      const canvas = document.createElement('canvas');
      canvas.width = isPassport ? 350 : 600;
      canvas.height = isPassport ? 450 : 600;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      if (nametagEnabled) {
        const previewWidth = isPassport ? 217.78 : 280;
        const outputScale = canvas.width / previewWidth;
        const sideMargin = Math.round(canvas.width * (isPassport ? 0.0073 : 0.01));
        const topMargin = sideMargin;
        const textWidth = canvas.width - sideMargin * 2;
        const outputFontSize = nametagFontSize * outputScale;
        const fontStyle = `${nametagItalic ? 'italic ' : ''}${nametagBold ? 'bold ' : ''}${outputFontSize}px Arial`;
        context.font = fontStyle;
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const lines = [];
        const words = nametagText.split(/\s+/).filter(Boolean);
        let line = '';
        words.forEach((word) => {
          const candidate = line ? `${line} ${word}` : word;
          if (context.measureText(candidate).width <= textWidth || !line) {
            line = candidate;
            return;
          }
          lines.push(line);
          line = word;
        });
        if (line) lines.push(line);

        const lineHeight = outputFontSize * 1.1;
        const textHeight = nametagBlank ? 0 : lines.length * lineHeight;
        const requestedHeight = Math.round(nametagHeight * (isPassport ? 254 : 600));
        const tagHeight = Math.min(canvas.height, Math.max(requestedHeight, textHeight + topMargin * 2));
        context.fillStyle = 'white';
        context.fillRect(0, canvas.height - tagHeight, canvas.width, tagHeight);

        if (!nametagBlank && lines.length > 0) {
          context.fillStyle = 'black';
          const textStart = canvas.height - tagHeight + (tagHeight - textHeight) / 2 + lineHeight / 2;
          lines.forEach((currentLine, index) => {
            context.fillText(currentLine, canvas.width / 2, textStart + index * lineHeight);
          });
        }
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `idit-${photoSize}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
      }, 'image/png');
    };
    image.src = photo.src;
  }

  return (
    <main className="editor-page">
      <Navbar
        activeLink={activeNavLink}
        setActiveLink={setActiveNavLink}
      />

      <div className="editor-container">

        <EditorTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onEditorTabSelected={() => setActiveNavLink(null)}
        />

        <div className="editor-workspace">

          {activeTab === 'photo' ? (
            <>
              <PreviewPanel
                photoSize={photoSize}
                photo={photo}
                cropMode={cropMode}
                photoError={photoError}
                onPhotoFile={handlePhotoFile}
                onCropDone={handlePhotoCropDone}
                onPhotoEdit={() => setCropMode(true)}
                onPhotoDelete={handlePhotoDelete}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                flipHorizontal={flipHorizontal}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={handleRotationChange}
                onRotationStep={handleRotationStep}
                onFlipHorizontal={() => setFlipHorizontal((current) => !current)}
                onReset={handlePhotoReset}
                onCropComplete={(_, croppedAreaPixels) => setCropAreaPixels(croppedAreaPixels)}
                nametagEnabled={nametagEnabled}
                nametagBlank={nametagBlank}
                nametagText={nametagText}
                nametagHeight={nametagHeight}
                nametagFontSize={nametagFontSize}
                nametagBold={nametagBold}
                nametagItalic={nametagItalic}
                onNametagMeasuredHeight={setNametagHeight}
              />
              <PhotoEditingPanel
                photoSize={photoSize}
                onPhotoSizeChange={handlePhotoSizeChange}
                nametagEnabled={nametagEnabled}
                nametagBlank={nametagBlank}
                nametagText={nametagText}
                nametagHeight={nametagHeight}
                nametagFontSize={nametagFontSize}
                nametagBold={nametagBold}
                nametagItalic={nametagItalic}
                onNametagEnabledChange={setNametagEnabled}
                onNametagBlankChange={setNametagBlank}
                onNametagTextChange={setNametagText}
                onNametagHeightChange={(value) => setNametagHeight(Number.isFinite(value) ? Math.min(1, Math.max(0.1, value)) : 0.1)}
                onNametagFontSizeChange={(value) => setNametagFontSize(Number.isFinite(value) ? Math.min(45, Math.max(8, value)) : 16)}
                onNametagBoldChange={() => setNametagBold((current) => !current)}
                onNametagItalicChange={() => setNametagItalic((current) => !current)}
                onDownload={handlePhotoDownload}
                downloadDisabled={!photo || cropMode}
                editingDisabled={!photo || cropMode}
              />
            </>
          ) : (
            <>
              <PrintLayoutPanel
                selectedTemplate={selectedTemplateId}
                onTemplateChange={handleTemplateChange}
              />
              <PreviewPanel
                printMode
                template={selectedTemplate}
                uploads={uploads}
                uploadError={printUploadError}
                onUpload={handleUpload}
              />
            </>
          )}

        </div>

      </div>
      <Footer />
    </main>
  );
}

export default Editor;