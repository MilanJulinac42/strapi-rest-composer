'use client';

import { useState } from 'react';
import { useQueryStore } from '@/store/queryStore';
import type { PopulateField, StrapiAttribute } from '@/lib/types';

interface NestedPopulateProps {
  parentPath: string[];
  level: number;
  onUpdate: (path: string[], populate: PopulateField[]) => void;
  currentPopulate: PopulateField[];
  parentFieldName: string;
}

function NestedPopulate({ parentPath, level, onUpdate, currentPopulate, parentFieldName }: NestedPopulateProps) {
  const { contentTypes, selectedCollection } = useQueryStore();
  const [newField, setNewField] = useState('');
  const [selectedFieldsForPopulate, setSelectedFieldsForPopulate] = useState<Record<string, string>>({});

  // Find the target content type for this relation by traversing the path
  const getTargetContentType = () => {
    // Start with the base selected collection
    const baseContentType = contentTypes.find(
      ct => ct.info?.pluralName === selectedCollection || ct.apiID === selectedCollection
    );

    if (!baseContentType?.attributes) return null;

    let currentAttributes = baseContentType.attributes;

    // Navigate through the path to find the final relation's target
    for (const fieldName of parentPath) {
      const attr = currentAttributes[fieldName];
      if (!attr?.target) return null;

      // Find the content type this relation points to
      const targetCt = contentTypes.find(ct => ct.uid === attr.target);
      if (!targetCt?.attributes) return null;

      currentAttributes = targetCt.attributes;
    }

    // Return the content type with these attributes
    return contentTypes.find(ct => ct.attributes === currentAttributes);
  };

  const parentContentType = getTargetContentType();

  // Track visited content types to prevent circular references
  const getVisitedContentTypes = () => {
    const visited = new Set<string>();

    // Start with the base selected collection
    const baseContentType = contentTypes.find(
      ct => ct.info?.pluralName === selectedCollection || ct.apiID === selectedCollection
    );

    if (baseContentType?.uid) {
      visited.add(baseContentType.uid);
    }

    let currentCt = baseContentType;

    // Navigate through the path and track each visited content type
    for (const fieldName of parentPath) {
      if (!currentCt?.attributes) break;

      const attr = currentCt.attributes[fieldName];
      if (attr?.target) {
        visited.add(attr.target);
        currentCt = contentTypes.find(ct => ct.uid === attr.target);
      }
    }

    return visited;
  };

  const visitedUids = getVisitedContentTypes();

  // Get relation fields that don't create circular references
  const relationFields = parentContentType?.attributes
    ? Object.entries(parentContentType.attributes)
        .filter(([_, attr]) => {
          if (attr.relation === undefined) return false;
          // Exclude relations that would create a circular reference
          if (attr.target && visitedUids.has(attr.target)) return false;
          return true;
        })
        .map(([name]) => name)
    : [];

  const handleAddNested = () => {
    if (!newField || currentPopulate.find(p => p.field === newField)) return;

    const newPopulate: PopulateField = { field: newField };
    onUpdate(parentPath, [...currentPopulate, newPopulate]);
    setNewField('');
  };

  const handleRemoveNested = (field: string) => {
    onUpdate(parentPath, currentPopulate.filter(p => p.field !== field));
  };

  const handleUpdateDeeper = (nestedPath: string[], deeperPopulate: PopulateField[]) => {
    const updatedPopulate = currentPopulate.map(p => {
      if (p.field === nestedPath[0]) {
        return { ...p, populate: deeperPopulate };
      }
      return p;
    });
    onUpdate(parentPath, updatedPopulate);
  };

  const handleAddFieldForPopulate = (populateFieldName: string, fieldToAdd: string) => {
    const updatedPopulate = currentPopulate.map(p => {
      if (p.field === populateFieldName) {
        const currentFields = p.fields || [];
        if (!currentFields.includes(fieldToAdd)) {
          return { ...p, fields: [...currentFields, fieldToAdd] };
        }
      }
      return p;
    });
    onUpdate(parentPath, updatedPopulate);
    setSelectedFieldsForPopulate({ ...selectedFieldsForPopulate, [populateFieldName]: '' });
  };

  const handleRemoveFieldForPopulate = (populateFieldName: string, fieldToRemove: string) => {
    const updatedPopulate = currentPopulate.map(p => {
      if (p.field === populateFieldName) {
        const currentFields = p.fields || [];
        return { ...p, fields: currentFields.filter(f => f !== fieldToRemove) };
      }
      return p;
    });
    onUpdate(parentPath, updatedPopulate);
  };

  return (
    <div className="ml-6 mt-2 border-l-2 border-green-200 pl-3 space-y-2">
      <div className="flex gap-2">
        <select
          value={newField}
          onChange={(e) => setNewField(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
        >
          <option value="" className="text-gray-500">Add nested relation...</option>
          {relationFields
            .filter(f => !currentPopulate.find(p => p.field === f))
            .map(field => (
              <option key={field} value={field} className="text-gray-900">{field}</option>
            ))}
        </select>
        <button
          onClick={handleAddNested}
          disabled={!newField}
          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
        >
          +
        </button>
      </div>

      {currentPopulate.map(popField => {
        // Get available fields for this populated relation
        const targetAttr = parentContentType?.attributes?.[popField.field];
        const targetContentType = targetAttr?.target
          ? contentTypes.find(ct => ct.uid === targetAttr.target)
          : null;
        const availableFieldsForPopulate = targetContentType?.attributes
          ? Object.keys(targetContentType.attributes).filter(
              (key) => !targetContentType.attributes[key].relation
            )
          : [];

        return (
          <div key={popField.field} className="space-y-1">
            <div className="flex items-center justify-between p-1 bg-green-100 border border-green-300 rounded text-xs">
              <span className="text-green-800 font-medium">{popField.field}</span>
              <button
                onClick={() => handleRemoveNested(popField.field)}
                className="text-green-700 hover:text-green-900"
              >
                ×
              </button>
            </div>

            {/* Field selection for this populated relation */}
            {availableFieldsForPopulate.length > 0 && (
              <div className="ml-2 space-y-1">
                <div className="flex gap-1">
                  <select
                    value={selectedFieldsForPopulate[popField.field] || ''}
                    onChange={(e) => setSelectedFieldsForPopulate({
                      ...selectedFieldsForPopulate,
                      [popField.field]: e.target.value
                    })}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
                  >
                    <option value="" className="text-gray-500">Select fields...</option>
                    {availableFieldsForPopulate
                      .filter(f => !(popField.fields || []).includes(f))
                      .map(field => (
                        <option key={field} value={field} className="text-gray-900">{field}</option>
                      ))}
                  </select>
                  <button
                    onClick={() => {
                      const fieldToAdd = selectedFieldsForPopulate[popField.field];
                      if (fieldToAdd) {
                        handleAddFieldForPopulate(popField.field, fieldToAdd);
                      }
                    }}
                    disabled={!selectedFieldsForPopulate[popField.field]}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                {/* Display selected fields */}
                {popField.fields && popField.fields.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {popField.fields.map(field => (
                      <span
                        key={field}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {field}
                        <button
                          onClick={() => handleRemoveFieldForPopulate(popField.field, field)}
                          className="hover:text-blue-900 focus:outline-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {relationFields.includes(popField.field) && (
              <NestedPopulate
                parentPath={[...parentPath, popField.field]}
                level={level + 1}
                onUpdate={handleUpdateDeeper}
                currentPopulate={popField.populate || []}
                parentFieldName={popField.field}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PopulateBuilder() {
  const { selectedCollection, contentTypes, populate, setPopulate } = useQueryStore();
  const [newPopulateField, setNewPopulateField] = useState('');
  const [selectedFieldsForPopulate, setSelectedFieldsForPopulate] = useState<Record<string, string>>({});

  const selectedContentType = contentTypes.find(
    (ct) => ct.info?.pluralName === selectedCollection || ct.apiID === selectedCollection
  );

  // Get relation fields
  const relationFields = selectedContentType?.attributes
    ? Object.entries(selectedContentType.attributes)
        .filter(([_, attr]) => attr.relation !== undefined)
        .map(([name]) => name)
    : [];

  const handleAddPopulate = () => {
    if (newPopulateField && !populate.find((p) => p.field === newPopulateField)) {
      const newPopulate: PopulateField = {
        field: newPopulateField,
      };
      setPopulate([...populate, newPopulate]);
      setNewPopulateField('');
    }
  };

  const handleRemovePopulate = (field: string) => {
    setPopulate(populate.filter(p => p.field !== field));
  };

  const handleUpdateNested = (path: string[], nestedPopulate: PopulateField[]) => {
    const updatedPopulate = populate.map(p => {
      if (p.field === path[0]) {
        return { ...p, populate: nestedPopulate };
      }
      return p;
    });
    setPopulate(updatedPopulate);
  };

  const handleAddFieldForPopulate = (populateFieldName: string, fieldToAdd: string) => {
    const updatedPopulate = populate.map(p => {
      if (p.field === populateFieldName) {
        const currentFields = p.fields || [];
        if (!currentFields.includes(fieldToAdd)) {
          return { ...p, fields: [...currentFields, fieldToAdd] };
        }
      }
      return p;
    });
    setPopulate(updatedPopulate);
    setSelectedFieldsForPopulate({ ...selectedFieldsForPopulate, [populateFieldName]: '' });
  };

  const handleRemoveFieldForPopulate = (populateFieldName: string, fieldToRemove: string) => {
    const updatedPopulate = populate.map(p => {
      if (p.field === populateFieldName) {
        const currentFields = p.fields || [];
        return { ...p, fields: currentFields.filter(f => f !== fieldToRemove) };
      }
      return p;
    });
    setPopulate(updatedPopulate);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Populate Relations
      </label>

      {!selectedCollection ? (
        <p className="text-sm text-gray-500">Select a collection first</p>
      ) : (
        <div className="space-y-3">
          {/* Populate Input */}
          <div className="flex gap-2">
            <select
              value={newPopulateField}
              onChange={(e) => setNewPopulateField(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
            >
              <option value="" className="text-gray-500">
                {relationFields.length > 0 ? 'Select relation...' : 'No relations available'}
              </option>
              {relationFields
                .filter((f) => !populate.find((p) => p.field === f))
                .map((field) => (
                  <option key={field} value={field} className="text-gray-900">
                    {field}
                  </option>
                ))}
            </select>
            <button
              onClick={handleAddPopulate}
              disabled={!newPopulateField}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Populated Fields with Nesting */}
          {populate.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Populated relations:</p>
              {populate.map((popField) => {
                // Get available fields for this populated relation
                const targetAttr = selectedContentType?.attributes?.[popField.field];
                const targetContentType = targetAttr?.target
                  ? contentTypes.find(ct => ct.uid === targetAttr.target)
                  : null;
                const availableFieldsForPopulate = targetContentType?.attributes
                  ? Object.keys(targetContentType.attributes).filter(
                      (key) => !targetContentType.attributes[key].relation
                    )
                  : [];

                return (
                  <div key={popField.field} className="space-y-1">
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
                      <span className="text-sm text-green-800 font-medium">
                        {popField.field}
                      </span>
                      <button
                        onClick={() => handleRemovePopulate(popField.field)}
                        className="text-green-700 hover:text-green-900 focus:outline-none"
                      >
                        ×
                      </button>
                    </div>

                    {/* Field selection for this populated relation */}
                    {availableFieldsForPopulate.length > 0 && (
                      <div className="ml-3 space-y-2">
                        <div className="flex gap-2">
                          <select
                            value={selectedFieldsForPopulate[popField.field] || ''}
                            onChange={(e) => setSelectedFieldsForPopulate({
                              ...selectedFieldsForPopulate,
                              [popField.field]: e.target.value
                            })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
                          >
                            <option value="" className="text-gray-500">Select fields...</option>
                            {availableFieldsForPopulate
                              .filter(f => !(popField.fields || []).includes(f))
                              .map(field => (
                                <option key={field} value={field} className="text-gray-900">{field}</option>
                              ))}
                          </select>
                          <button
                            onClick={() => {
                              const fieldToAdd = selectedFieldsForPopulate[popField.field];
                              if (fieldToAdd) {
                                handleAddFieldForPopulate(popField.field, fieldToAdd);
                              }
                            }}
                            disabled={!selectedFieldsForPopulate[popField.field]}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            Add Field
                          </button>
                        </div>

                        {/* Display selected fields */}
                        {popField.fields && popField.fields.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {popField.fields.map(field => (
                              <span
                                key={field}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {field}
                                <button
                                  onClick={() => handleRemoveFieldForPopulate(popField.field, field)}
                                  className="hover:text-blue-900 focus:outline-none"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {relationFields.includes(popField.field) && (
                      <NestedPopulate
                        parentPath={[popField.field]}
                        level={1}
                        onUpdate={handleUpdateNested}
                        currentPopulate={popField.populate || []}
                        parentFieldName={popField.field}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-gray-500">
            Click on a relation to add nested populations
          </p>
        </div>
      )}
    </div>
  );
}
