function PhotoEditingPanel({
  photoSize,
  onPhotoSizeChange,
  nametagEnabled,
  nametagBlank,
  nametagText,
  nametagHeight,
  nametagFontSize,
  nametagBold,
  nametagItalic,
  onNametagEnabledChange,
  onNametagBlankChange,
  onNametagTextChange,
  onNametagHeightChange,
  onNametagFontSizeChange,
  onNametagBoldChange,
  onNametagItalicChange,
  onDownload,
  downloadDisabled,
  editingDisabled,
}) {
  return (
    <div className="photo-editing-panel">

      <section>
        <h3>PHOTO RATIO</h3>

        <label>
          <input
            type="radio"
            name="photoSize"
            value="square"
            checked={photoSize === 'square'}
            onChange={() => onPhotoSizeChange('square')}
          />
          Square (1x1 in / 1.5x1.5 in / 2x2 in)
        </label>

        <label>
          <input
            type="radio"
            name="photoSize"
            value="passport"
            checked={photoSize === 'passport'}
            onChange={() => onPhotoSizeChange('passport')}
          />
          Passport (35 × 45 mm)
        </label>

      </section>

      <section>
        <h3>NAMETAG</h3>

        <label>
          <input
            type="checkbox"
            checked={nametagEnabled}
            disabled={editingDisabled}
            onChange={(event) => onNametagEnabledChange(event.target.checked)}
          />
          Add nametag
        </label>

        <label htmlFor="nametag-name">Name:</label>
        <input
          id="nametag-name"
          type="text"
          value={nametagText}
          disabled={editingDisabled || !nametagEnabled || nametagBlank}
          onChange={(event) => onNametagTextChange(event.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={nametagBlank}
            disabled={editingDisabled || !nametagEnabled}
            onChange={(event) => onNametagBlankChange(event.target.checked)}
          />
          Leave blank
        </label>

        <div className="dimension-inputs">
          <div>
            <label htmlFor="nametag-height">Height (in):</label>
            <input
              id="nametag-height"
              type="number"
              min="0.1"
              max="1"
              step="0.05"
              value={nametagHeight}
              disabled={editingDisabled || !nametagEnabled}
              onChange={(event) => onNametagHeightChange(Number(event.target.value))}
            />
          </div>

          <div>
            <label htmlFor="nametag-font-size">Font size (px):</label>
            <input
              id="nametag-font-size"
              type="number"
              min="8"
              max="45"
              step="1"
              value={nametagFontSize}
              disabled={editingDisabled || !nametagEnabled || nametagBlank}
              onChange={(event) => onNametagFontSizeChange(Number(event.target.value))}
            />
          </div>

          <div className="nametag-style-controls">
            <span>Style:</span>
            <div className="nametag-icon-row">
              <button
                className={`nametag-icon-button ${nametagBold ? 'active' : ''}`}
                type="button"
                aria-label="Toggle bold"
                aria-pressed={nametagBold}
                title="Toggle bold"
                disabled={editingDisabled}
                onClick={onNametagBoldChange}
              >
                <strong>B</strong>
              </button>
              <button
                className={`nametag-icon-button ${nametagItalic ? 'active' : ''}`}
                type="button"
                aria-label="Toggle italic"
                aria-pressed={nametagItalic}
                title="Toggle italic"
                disabled={editingDisabled}
                onClick={onNametagItalicChange}
              >
                <em>I</em>
              </button>
            </div>
          </div>

        </div>
      </section>

      <button
        className="download-button"
        type="button"
        disabled={downloadDisabled}
        onClick={onDownload}
      >
        Download
      </button>

    </div>
  );
}

export default PhotoEditingPanel;