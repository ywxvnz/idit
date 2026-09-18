function EditorTabs({ activeTab, setActiveTab, onEditorTabSelected }) {
  return (
    <div className="editor-tabs">

      <button
        className={activeTab === 'layout' ? 'active' : ''}
        onClick={() => {
          setActiveTab('layout');
          onEditorTabSelected();
        }}
      >
        PRINT LAYOUT
      </button>

      <button
        className={activeTab === 'photo' ? 'active' : ''}
        onClick={() => {
          setActiveTab('photo');
          onEditorTabSelected();
        }}
      >
        PHOTO EDITING
      </button>

    </div>
  );
}

export default EditorTabs;