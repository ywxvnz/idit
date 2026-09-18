import { templates } from '../data/templates';

function PrintLayoutPanel({ selectedTemplate, onTemplateChange }) {
  return (
    <div className="print-layout-panel">

      <h3>TEMPLATE</h3>

      {templates.map((template) => (
        <label key={template.id}>
          <input
            type="radio"
            name="template"
            value={template.id}
            checked={selectedTemplate === template.id}
            onChange={() => onTemplateChange(template.id)}
          />
          {template.label}
        </label>
      ))}

    </div>
  );
}

export default PrintLayoutPanel;