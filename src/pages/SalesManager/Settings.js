import React, { useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaWrench,
  FaStream,
  FaTasks,
  FaUserShield,
  FaSitemap,
  FaChevronRight,
  FaRobot,
  FaEnvelopeOpenText,
  FaCopy,
} from "react-icons/fa";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PermissionsSettings = () => {
  const [roles, setRoles] = useState([
    { id: 1, name: 'Sales Manager', permissions: ['view_all_leads', 'edit_all_leads', 'delete_leads', 'manage_pipeline', 'assign_leads', 'view_reports'] },
    { id: 2, name: 'Sales Executive', permissions: ['view_own_leads', 'edit_own_leads', 'create_leads', 'schedule_activities'] },
    { id: 3, name: 'Designer', permissions: ['view_assigned_leads', 'edit_assigned_leads', 'upload_designs'] },
  ]);
  
  const [newRoleName, setNewRoleName] = useState('');
  const [isAddingRole, setIsAddingRole] = useState(false);
  
  const allPermissions = [
    { id: 'view_all_leads', name: 'View All Leads', category: 'Leads' },
    { id: 'view_own_leads', name: 'View Own Leads', category: 'Leads' },
    { id: 'view_assigned_leads', name: 'View Assigned Leads', category: 'Leads' },
    { id: 'edit_all_leads', name: 'Edit All Leads', category: 'Leads' },
    { id: 'edit_own_leads', name: 'Edit Own Leads', category: 'Leads' },
    { id: 'edit_assigned_leads', name: 'Edit Assigned Leads', category: 'Leads' },
    { id: 'create_leads', name: 'Create New Leads', category: 'Leads' },
    { id: 'delete_leads', name: 'Delete Leads', category: 'Leads' },
    { id: 'assign_leads', name: 'Assign Leads to Team', category: 'Management' },
    { id: 'manage_pipeline', name: 'Manage Pipeline Stages', category: 'Management' },
    { id: 'view_reports', name: 'View Reports & Analytics', category: 'Reports' },
    { id: 'schedule_activities', name: 'Schedule Activities', category: 'Activities' },
    { id: 'upload_designs', name: 'Upload Design Files', category: 'Design' },
  ];

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      const newRole = {
        id: Date.now(),
        name: newRoleName.trim(),
        permissions: []
      };
      setRoles(prev => [...prev, newRole]);
      setNewRoleName('');
      setIsAddingRole(false);
      toast.success('Role added successfully');
    }
  };

  const handlePermissionToggle = (roleId, permissionId) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const hasPermission = role.permissions.includes(permissionId);
        return {
          ...role,
          permissions: hasPermission
            ? role.permissions.filter(p => p !== permissionId)
            : [...role.permissions, permissionId]
        };
      }
      return role;
    }));
  };

  const handleDeleteRole = (roleId) => {
    setRoles(prev => prev.filter(role => role.id !== roleId));
    toast.success('Role deleted successfully');
  };

  const permissionsByCategory = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">User Roles & Permissions</h3>
          <p className="text-sm text-gray-600">Define what each user role can see and do within this module.</p>
        </div>
        <button
          onClick={() => setIsAddingRole(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Add Role
        </button>
      </div>

      {isAddingRole && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Enter role name"
                className="border p-2 rounded-md w-full"
                autoFocus
              />
            </div>
            <button onClick={handleAddRole} className="px-4 py-2 bg-green-600 text-white rounded-md">Save</button>
            <button onClick={() => setIsAddingRole(false)} className="px-4 py-2 border rounded-md">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {roles.map(role => (
          <div key={role.id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">{role.name}</h4>
              <button
                onClick={() => handleDeleteRole(role.id)}
                className="text-red-600 hover:text-red-800 p-2"
                title="Delete Role"
              >
                <FaTrash />
              </button>
            </div>
            
            <div className="space-y-4">
              {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <div key={category}>
                  <h5 className="font-medium text-gray-700 mb-2">{category}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {permissions.map(permission => (
                      <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={role.permissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(role.id, permission.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkflowSettings = () => {
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: 'Lead Conversion Approval',
      description: 'Approval required before converting leads to customers',
      stages: [
        { id: 1, role: 'Sales Executive', action: 'Submit for Approval' },
        { id: 2, role: 'Sales Manager', action: 'Review & Approve' },
        { id: 3, role: 'Admin', action: 'Final Approval' }
      ],
      isActive: true
    }
  ]);

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    stages: [{ id: 1, role: '', action: '' }]
  });
  const [isAddingWorkflow, setIsAddingWorkflow] = useState(false);

  const availableRoles = ['Sales Executive', 'Sales Manager', 'Designer', 'Admin'];

  const handleAddWorkflow = () => {
    if (newWorkflow.name.trim() && newWorkflow.stages.every(s => s.role && s.action)) {
      const workflow = {
        ...newWorkflow,
        id: Date.now(),
        isActive: true
      };
      setWorkflows(prev => [...prev, workflow]);
      setNewWorkflow({ name: '', description: '', stages: [{ id: 1, role: '', action: '' }] });
      setIsAddingWorkflow(false);
      toast.success('Workflow created successfully');
    } else {
      toast.error('Please fill all required fields');
    }
  };

  const addStageToNewWorkflow = () => {
    setNewWorkflow(prev => ({
      ...prev,
      stages: [...prev.stages, { id: Date.now(), role: '', action: '' }]
    }));
  };

  const updateNewWorkflowStage = (stageId, field, value) => {
    setNewWorkflow(prev => ({
      ...prev,
      stages: prev.stages.map(stage =>
        stage.id === stageId ? { ...stage, [field]: value } : stage
      )
    }));
  };

  const removeStageFromNewWorkflow = (stageId) => {
    setNewWorkflow(prev => ({
      ...prev,
      stages: prev.stages.filter(stage => stage.id !== stageId)
    }));
  };

  const toggleWorkflowStatus = (workflowId) => {
    setWorkflows(prev => prev.map(workflow =>
      workflow.id === workflowId ? { ...workflow, isActive: !workflow.isActive } : workflow
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Approval Workflows</h3>
          <p className="text-sm text-gray-600">Set up approval sequences for different processes.</p>
        </div>
        <button
          onClick={() => setIsAddingWorkflow(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Create Workflow
        </button>
      </div>

      {isAddingWorkflow && (
        <div className="bg-gray-50 border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Create New Workflow</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
              <input
                type="text"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                className="border p-2 rounded-md w-full"
                placeholder="Enter workflow name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                className="border p-2 rounded-md w-full h-20"
                placeholder="Describe this workflow"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">Approval Stages</label>
                <button
                  onClick={addStageToNewWorkflow}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Stage
                </button>
              </div>
              
              <div className="space-y-3">
                {newWorkflow.stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center gap-3 p-3 bg-white border rounded">
                    <span className="text-sm font-medium text-gray-500 w-8">#{index + 1}</span>
                    <select
                      value={stage.role}
                      onChange={(e) => updateNewWorkflowStage(stage.id, 'role', e.target.value)}
                      className="border p-2 rounded flex-1"
                    >
                      <option value="">Select Role</option>
                      {availableRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={stage.action}
                      onChange={(e) => updateNewWorkflowStage(stage.id, 'action', e.target.value)}
                      placeholder="Action description"
                      className="border p-2 rounded flex-1"
                    />
                    {newWorkflow.stages.length > 1 && (
                      <button
                        onClick={() => removeStageFromNewWorkflow(stage.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={handleAddWorkflow} className="px-4 py-2 bg-green-600 text-white rounded">Save Workflow</button>
              <button onClick={() => setIsAddingWorkflow(false)} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {workflows.map(workflow => (
          <div key={workflow.id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{workflow.name}</h4>
                <p className="text-sm text-gray-600">{workflow.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded ${workflow.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {workflow.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => toggleWorkflowStatus(workflow.id)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  {workflow.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 overflow-x-auto">
              {workflow.stages.map((stage, index) => (
                <div key={stage.id} className="flex items-center gap-2 flex-shrink-0">
                  <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                    <div className="font-medium">{stage.role}</div>
                    <div className="text-xs">{stage.action}</div>
                  </div>
                  {index < workflow.stages.length - 1 && (
                    <FaChevronRight className="text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AutomationSettings = () => {
  const [rules, setRules] = useState([
    {
      id: 1,
      name: 'New Lead Alert',
      trigger: 'lead_created',
      conditions: [{ field: 'leadSource', operator: 'equals', value: 'Website' }],
      actions: [{ type: 'send_notification', target: 'sales_team', message: 'New website lead received' }],
      isActive: true
    }
  ]);

  const [newRule, setNewRule] = useState({
    name: '',
    trigger: '',
    conditions: [{ field: '', operator: '', value: '' }],
    actions: [{ type: '', target: '', message: '' }]
  });
  const [isAddingRule, setIsAddingRule] = useState(false);

  const triggers = [
    { id: 'lead_created', name: 'When Lead is Created' },
    { id: 'lead_updated', name: 'When Lead is Updated' },
    { id: 'status_changed', name: 'When Status Changes' },
    { id: 'activity_scheduled', name: 'When Activity is Scheduled' },
    { id: 'activity_overdue', name: 'When Activity is Overdue' }
  ];

  const conditionFields = [
    { id: 'leadSource', name: 'Lead Source' },
    { id: 'projectType', name: 'Project Type' },
    { id: 'budget', name: 'Budget' },
    { id: 'status', name: 'Status' },
    { id: 'rating', name: 'Rating' }
  ];

  const operators = [
    { id: 'equals', name: 'Equals' },
    { id: 'not_equals', name: 'Not Equals' },
    { id: 'greater_than', name: 'Greater Than' },
    { id: 'less_than', name: 'Less Than' },
    { id: 'contains', name: 'Contains' }
  ];

  const actionTypes = [
    { id: 'send_notification', name: 'Send Notification' },
    { id: 'send_email', name: 'Send Email' },
    { id: 'send_sms', name: 'Send SMS' },
    { id: 'assign_lead', name: 'Assign Lead' },
    { id: 'update_field', name: 'Update Field' }
  ];

  const handleAddRule = () => {
    if (newRule.name.trim() && newRule.trigger) {
      const rule = {
        ...newRule,
        id: Date.now(),
        isActive: true
      };
      setRules(prev => [...prev, rule]);
      setNewRule({
        name: '',
        trigger: '',
        conditions: [{ field: '', operator: '', value: '' }],
        actions: [{ type: '', target: '', message: '' }]
      });
      setIsAddingRule(false);
      toast.success('Automation rule created successfully');
    }
  };

  const addCondition = () => {
    setNewRule(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: '', operator: '', value: '' }]
    }));
  };

  const addAction = () => {
    setNewRule(prev => ({
      ...prev,
      actions: [...prev.actions, { type: '', target: '', message: '' }]
    }));
  };

  const updateCondition = (index, field, value) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions.map((cond, i) =>
        i === index ? { ...cond, [field]: value } : cond
      )
    }));
  };

  const updateAction = (index, field, value) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) =>
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const toggleRuleStatus = (ruleId) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Automation Rules</h3>
          <p className="text-sm text-gray-600">Create IF-THEN rules to automate tasks and notifications.</p>
        </div>
        <button
          onClick={() => setIsAddingRule(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaRobot /> Create Rule
        </button>
      </div>

      {isAddingRule && (
        <div className="bg-gray-50 border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Create Automation Rule</h4>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
              <input
                type="text"
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                className="border p-2 rounded-md w-full"
                placeholder="Enter rule name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trigger</label>
              <select
                value={newRule.trigger}
                onChange={(e) => setNewRule(prev => ({ ...prev, trigger: e.target.value }))}
                className="border p-2 rounded-md w-full"
              >
                <option value="">Select trigger</option>
                {triggers.map(trigger => (
                  <option key={trigger.id} value={trigger.id}>{trigger.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">Conditions</label>
                <button
                  onClick={addCondition}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded"
                >
                  Add Condition
                </button>
              </div>
              {newRule.conditions.map((condition, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={condition.field}
                    onChange={(e) => updateCondition(index, 'field', e.target.value)}
                    className="border p-2 rounded flex-1"
                  >
                    <option value="">Select field</option>
                    {conditionFields.map(field => (
                      <option key={field.id} value={field.id}>{field.name}</option>
                    ))}
                  </select>
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                    className="border p-2 rounded flex-1"
                  >
                    <option value="">Select operator</option>
                    {operators.map(op => (
                      <option key={op.id} value={op.id}>{op.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="border p-2 rounded flex-1"
                  />
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">Actions</label>
                <button
                  onClick={addAction}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded"
                >
                  Add Action
                </button>
              </div>
              {newRule.actions.map((action, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={action.type}
                    onChange={(e) => updateAction(index, 'type', e.target.value)}
                    className="border p-2 rounded flex-1"
                  >
                    <option value="">Select action</option>
                    {actionTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={action.target}
                    onChange={(e) => updateAction(index, 'target', e.target.value)}
                    placeholder="Target"
                    className="border p-2 rounded flex-1"
                  />
                  <input
                    type="text"
                    value={action.message}
                    onChange={(e) => updateAction(index, 'message', e.target.value)}
                    placeholder="Message"
                    className="border p-2 rounded flex-1"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={handleAddRule} className="px-4 py-2 bg-green-600 text-white rounded">Save Rule</button>
              <button onClick={() => setIsAddingRule(false)} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {rules.map(rule => (
          <div key={rule.id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{rule.name}</h4>
                <p className="text-sm text-gray-600">
                  Trigger: {triggers.find(t => t.id === rule.trigger)?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {rule.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => toggleRuleStatus(rule.id)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  {rule.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Conditions</h5>
                {rule.conditions.map((condition, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    {conditionFields.find(f => f.id === condition.field)?.name} {operators.find(o => o.id === condition.operator)?.name} {condition.value}
                  </div>
                ))}
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Actions</h5>
                {rule.actions.map((action, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    {actionTypes.find(t => t.id === action.type)?.name}: {action.message || action.target}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TemplatesSettings = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Welcome Email',
      type: 'email',
      subject: 'Welcome to ArunMedhir Interior Design',
      content: 'Dear {name}, Thank you for your interest in our interior design services...',
      isActive: true
    },
    {
      id: 2,
      name: 'Follow-up SMS',
      type: 'sms',
      subject: '',
      content: 'Hi {name}, Following up on your interior design inquiry. Call us at {phone} for a free consultation.',
      isActive: true
    }
  ]);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'email',
    subject: '',
    content: ''
  });
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState('email');

  const handleAddTemplate = () => {
    if (newTemplate.name.trim() && newTemplate.content.trim()) {
      const template = {
        ...newTemplate,
        id: Date.now(),
        isActive: true
      };
      setTemplates(prev => [...prev, template]);
      setNewTemplate({ name: '', type: 'email', subject: '', content: '' });
      setIsAddingTemplate(false);
      toast.success('Template created successfully');
    }
  };

  const toggleTemplateStatus = (templateId) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId ? { ...template, isActive: !template.isActive } : template
    ));
  };

  const deleteTemplate = (templateId) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
    toast.success('Template deleted successfully');
  };

  const emailTemplates = templates.filter(t => t.type === 'email');
  const smsTemplates = templates.filter(t => t.type === 'sms');

  const availableVariables = [
    '{name}', '{email}', '{phone}', '{projectType}', '{budget}', '{address}', '{salesRep}', '{designer}'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Email & SMS Templates</h3>
          <p className="text-sm text-gray-600">Create and manage standardized templates for your team.</p>
        </div>
        <button
          onClick={() => setIsAddingTemplate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaEnvelopeOpenText /> Create Template
        </button>
      </div>

      {isAddingTemplate && (
        <div className="bg-gray-50 border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Create New Template</h4>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="border p-2 rounded-md w-full"
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value }))}
                  className="border p-2 rounded-md w-full"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
            </div>

            {newTemplate.type === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  className="border p-2 rounded-md w-full"
                  placeholder="Enter email subject"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                className="border p-2 rounded-md w-full h-32"
                placeholder="Enter template content"
              />
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Available variables:</p>
                <div className="flex flex-wrap gap-1">
                  {availableVariables.map(variable => (
                    <button
                      key={variable}
                      onClick={() => setNewTemplate(prev => ({ ...prev, content: prev.content + variable }))}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAddTemplate} className="px-4 py-2 bg-green-600 text-white rounded">Save Template</button>
              <button onClick={() => setIsAddingTemplate(false)} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('email')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'email' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Email Templates ({emailTemplates.length})
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'sms' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              SMS Templates ({smsTemplates.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'email' && (
            <div className="space-y-4">
              {emailTemplates.map(template => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{template.name}</h4>
                      <p className="text-sm text-gray-600 font-medium">Subject: {template.subject}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => toggleTemplateStatus(template.id)}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        {template.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {template.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sms' && (
            <div className="space-y-4">
              {smsTemplates.map(template => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-800">{template.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => toggleTemplateStatus(template.id)}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        {template.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {template.content}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Character count: {template.content.length}/160
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StageDependentFormsSettings = ({ stages }) => {
  const [stageForms, setStageForms] = useState([
    {
      id: 1,
      stageId: 4, // Quoted stage
      stageName: 'Quoted',
      formName: 'Quotation Form',
      fields: [
        { id: 1, name: 'quotedAmount', label: 'Quoted Amount', type: 'number', required: true },
        { id: 2, name: 'quotationDate', label: 'Quotation Date', type: 'date', required: true },
        { id: 3, name: 'validUntil', label: 'Valid Until', type: 'date', required: true },
        { id: 4, name: 'quotationNotes', label: 'Quotation Notes', type: 'textarea', required: false }
      ],
      isActive: true
    },
    {
      id: 2,
      stageId: 5, // Converted stage
      stageName: 'Converted',
      formName: 'Conversion Form',
      fields: [
        { id: 1, name: 'finalQuotation', label: 'Final Quotation Amount', type: 'number', required: true },
        { id: 2, name: 'signupAmount', label: 'Signup Amount', type: 'number', required: true },
        { id: 3, name: 'paymentDate', label: 'Payment Date', type: 'date', required: true },
        { id: 4, name: 'paymentMode', label: 'Payment Mode', type: 'select', options: ['Cash', 'Cheque', 'Bank Transfer', 'UPI'], required: true },
        { id: 5, name: 'panNumber', label: 'PAN Number', type: 'text', required: false },
        { id: 6, name: 'discount', label: 'Discount %', type: 'number', required: false }
      ],
      isActive: true
    }
  ]);

  const [selectedStage, setSelectedStage] = useState('');
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [newForm, setNewForm] = useState({
    formName: '',
    fields: [{ id: 1, name: '', label: '', type: 'text', required: true }]
  });

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone' },
    { value: 'date', label: 'Date' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'file', label: 'File Upload' }
  ];

  const availableStages = stages.filter(stage => 
    stage.isForm && !stageForms.find(form => form.stageId === stage.id)
  );

  const handleCreateForm = () => {
    if (!selectedStage || !newForm.formName.trim()) {
      toast.error('Please select a stage and enter form name');
      return;
    }

    const stage = stages.find(s => s.id === parseInt(selectedStage));
    if (!stage) return;

    const form = {
      id: Date.now(),
      stageId: stage.id,
      stageName: stage.name,
      formName: newForm.formName,
      fields: newForm.fields.filter(field => field.name && field.label),
      isActive: true
    };

    setStageForms(prev => [...prev, form]);
    setNewForm({ formName: '', fields: [{ id: 1, name: '', label: '', type: 'text', required: true }] });
    setSelectedStage('');
    setIsCreatingForm(false);
    toast.success('Form created successfully');
  };

  const addField = () => {
    setNewForm(prev => ({
      ...prev,
      fields: [...prev.fields, { id: Date.now(), name: '', label: '', type: 'text', required: true }]
    }));
  };
  
  const updateField = (fieldId, property, value) => {
    setNewForm(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, [property]: value } : field
      )
    }));
  };

  const removeField = (fieldId) => {
    setNewForm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const deleteForm = (formId) => {
    setStageForms(prev => prev.filter(form => form.id !== formId));
    toast.success('Form deleted successfully');
  };

  const toggleFormStatus = (formId) => {
    setStageForms(prev => prev.map(form =>
      form.id === formId ? { ...form, isActive: !form.isActive } : form
    ));
  };

  const duplicateForm = (form) => {
    const duplicatedForm = {
      ...form,
      id: Date.now(),
      formName: `${form.formName} (Copy)`,
      fields: form.fields.map(field => ({ ...field, id: Date.now() + Math.random() }))
    };
    setStageForms(prev => [...prev, duplicatedForm]);
    toast.success('Form duplicated successfully');
  };
          
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Stage Dependent Forms</h3>
          <p className="text-sm text-gray-600">Create custom forms that are required when leads move to specific pipeline stages.</p>
        </div>
        <button 
          onClick={() => setIsCreatingForm(true)}
          disabled={availableStages.length === 0}
          className={`px-4 py-2 text-sm rounded-md flex items-center gap-2 ${
            availableStages.length === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <FaPlus /> Create Form
        </button>
      </div>

      {availableStages.length === 0 && !isCreatingForm && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No stages available for form creation. Please add pipeline stages with "Form Required" enabled first.
          </p>
        </div>
      )}

      {isCreatingForm && (
        <div className="bg-gray-50 border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Create Stage Form</h4>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Stage</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="border p-2 rounded-md w-full"
                >
                  <option value="">Choose a stage</option>
                  {availableStages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
                <input
                  type="text"
                  value={newForm.formName}
                  onChange={(e) => setNewForm(prev => ({ ...prev, formName: e.target.value }))}
                  placeholder="Enter form name"
                  className="border p-2 rounded-md w-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Form Fields</label>
                <button
                  onClick={addField}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Field
                </button>
              </div>

              <div className="space-y-4">
                {newForm.fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-gray-700">Field {index + 1}</h5>
                      {newForm.fields.length > 1 && (
                        <button
                          onClick={() => removeField(field.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Field Name</label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(field.id, 'name', e.target.value)}
                          placeholder="fieldName"
                          className="border p-2 rounded text-sm w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.id, 'label', e.target.value)}
                          placeholder="Display Label"
                          className="border p-2 rounded text-sm w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, 'type', e.target.value)}
                          className="border p-2 rounded text-sm w-full"
                        >
                          {fieldTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          Required
                        </label>
                      </div>
                    </div>

                    {field.type === 'select' && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Options (comma separated)</label>
                        <input
                          type="text"
                          value={field.options ? field.options.join(', ') : ''}
                          onChange={(e) => updateField(field.id, 'options', e.target.value.split(', ').filter(Boolean))}
                          placeholder="Option 1, Option 2, Option 3"
                          className="border p-2 rounded text-sm w-full"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCreateForm} className="px-4 py-2 bg-green-600 text-white rounded">Create Form</button>
              <button onClick={() => setIsCreatingForm(false)} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {stageForms.map(form => (
          <div key={form.id} className="bg-white border rounded-lg">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{form.formName}</h4>
                  <p className="text-sm text-gray-600">Required for stage: <span className="font-medium">{form.stageName}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${form.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => toggleFormStatus(form.id)}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    {form.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => duplicateForm(form)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    title="Duplicate Form"
                  >
                    <FaCopy />
                  </button>
                  <button
                    onClick={() => deleteForm(form.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete Form"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h5 className="font-medium text-gray-700 mb-3">Form Fields ({form.fields.length})</h5>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {form.fields.map(field => (
                  <div key={field.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-gray-800">{field.label}</span>
                      {field.required && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Required</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      <div>Name: {field.name}</div>
                      <div>Type: {fieldTypes.find(t => t.value === field.type)?.label}</div>
                      {field.options && (
                        <div>Options: {field.options.join(', ')}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {stageForms.length === 0 && !isCreatingForm && (
        <div className="text-center py-12 text-gray-500">
          <FaWrench className="mx-auto text-4xl mb-4 text-gray-300" />
          <p>No stage forms created yet.</p>
          <p className="text-sm">Create forms that will be required when leads move to specific stages.</p>
        </div>
      )}
    </div>
  );
};

const PipelineSettings = ({ stages, setStages, leads, onDeleteStages }) => {
  const [newStageName, setNewStageName] = useState("");
  const [newStageIsForm, setNewStageIsForm] = useState(false);
  const [newStageColor, setNewStageColor] = useState('#3b82f6');
  const [isAddingStage, setIsAddingStage] = useState(false);

  const handleAddStage = () => {
    if (newStageName && !stages.some(s => s.name === newStageName)) {
      const newStage = {
        id: Date.now(),
        name: newStageName,
        isForm: newStageIsForm,
        color: newStageColor
      };
      setStages(prev => [...prev, newStage]);
      setNewStageName("");
      setNewStageIsForm(false);
      setNewStageColor('#3b82f6');
      setIsAddingStage(false);
      toast.success('Stage added successfully');
    }
  };

  const handleDeleteStage = (stageToDelete) => {
    onDeleteStages([stageToDelete.name]);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setStages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const SortableStageItem = ({ stage }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: stage.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white border rounded-lg p-4 shadow-sm"
        {...attributes}
        {...listeners}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <span className="font-medium">{stage.name}</span>
            {stage.isForm && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                Form Required
              </span>
            )}
          </div>
          <button
            onClick={() => handleDeleteStage(stage)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete Stage"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Pipeline Stages</h3>
          <p className="text-sm text-gray-600">Add, remove, and reorder the stages in your sales pipeline.</p>
        </div>
        <button
          onClick={() => setIsAddingStage(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Add Stage
        </button>
      </div>

      {isAddingStage && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium mb-4">Add New Stage</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage Name</label>
              <input
                type="text"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="Enter stage name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <input
                type="color"
                value={newStageColor}
                onChange={(e) => setNewStageColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newStageIsForm}
                  onChange={(e) => setNewStageIsForm(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">Require form</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddStage}
              disabled={!newStageName.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md transition-all duration-200"
            >
              Add Stage
            </button>
            <button
              onClick={() => setIsAddingStage(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stages.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {stages.map((stage) => (
              <SortableStageItem key={stage.id} stage={stage} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {stages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FaStream className="mx-auto text-3xl mb-2" />
          <p>No pipeline stages configured</p>
        </div>
      )}
    </div>
  );
};


const SettingsPage = ({ 
  leads, 
  kanbanStatuses, 
  setKanbanStatuses, 
  onDeleteStages,
}) => {
  const [activeSettingsPage, setActiveSettingsPage] = useState('pipelineStages');

  const settingsPages = [
    { id: 'pipelineStages', label: 'Pipeline Stages', icon: FaStream, description: 'Add, remove, and reorder the stages in your sales pipeline.' },
    { id: 'stageForms', label: 'Stage Dependent Forms', icon: FaTasks, description: 'Create custom forms required for specific pipeline stages.' },
    { id: 'permissions', label: 'User Roles & Permissions', icon: FaUserShield, description: 'Define what each user role can see and do within this module.' },
    { id: 'workflow', label: 'Approval Workflow', icon: FaSitemap, description: 'Set up a sequence of roles that must approve a lead to proceed.' },
    { id: 'automation', label: 'Automation Rules', icon: FaRobot, description: 'Create IF-THEN rules to automate tasks like alerts and notifications.' },
    { id: 'templates', label: 'Email & SMS Templates', icon: FaEnvelopeOpenText, description: 'Create and manage standardized templates for your team to use.' },
  ];

  const activePage = settingsPages.find(p => p.id === activeSettingsPage);

  const renderSettingsContent = () => {
    switch (activeSettingsPage) {
      case 'pipelineStages':
        return (
          <PipelineSettings
            stages={kanbanStatuses}
            setStages={setKanbanStatuses}
            leads={leads}
            onDeleteStages={onDeleteStages}
          />
        );
      case 'stageForms':
        return <StageDependentFormsSettings stages={kanbanStatuses} />;
      case 'permissions':
        return <PermissionsSettings />;
      case 'workflow':
        return <WorkflowSettings />;
      case 'automation':
        return <AutomationSettings />;
      case 'templates':
        return <TemplatesSettings />;
      default:
        return <div className="text-center text-gray-500">Select a setting to configure.</div>;
    }
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg -m-6">
      {/* Top Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex flex-wrap gap-1 border-b border-gray-200">
          {settingsPages.map(page => (
            <button
              key={page.id}
              onClick={() => setActiveSettingsPage(page.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeSettingsPage === page.id
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <page.icon className="w-4 h-4 flex-shrink-0" />
              <span>{page.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        {activePage && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <activePage.icon className="w-6 h-6 text-gray-400" />
              {activePage.label}
            </h3>
            <p className="mt-2 text-sm text-gray-600">{activePage.description}</p>
          </div>
        )}
        {renderSettingsContent()}
      </div>
    </div>
  );
};

export default SettingsPage;