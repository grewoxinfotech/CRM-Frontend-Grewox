// Professional email templates with HTML formatting
export const emailTemplates = {
  newEmployee: {
    name: 'New Employee Welcome',
    subject: 'Welcome to {{company_name}} - Your Journey Begins!',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear {{employee_name}},</p>
        
        <p>Welcome to the {{company_name}} family! We are thrilled to have you join us as {{position}} in our {{department}} department.</p>
        
        <h3 style="color: #2c3e50;">Your First Day Details</h3>
        <ul style="list-style: none; padding-left: 0;">
          <li>📅 Start Date: {{start_date}}</li>
          <li>🏢 Location: {{office_address}}</li>
          <li>⏰ Arrival Time: {{start_time}}</li>
          <li>👥 Reporting Manager: {{manager_name}}</li>
        </ul>

        <p>Your onboarding buddy will be waiting to welcome you and help you get settled in.</p>

        <p>Best regards,<br>
        {{sender_name}}<br>
        HR Department<br>
        {{company_name}}</p>
      </div>
    `,
    fields: ['company_name', 'employee_name', 'position', 'department', 'start_date', 'office_address', 'start_time', 'manager_name', 'sender_name']
  },

  salaryRevision: {
    name: 'Salary Revision Notice',
    subject: 'Salary Revision Notification - Effective {{effective_date}}',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear {{employee_name}},</p>
        
        <p>We are pleased to inform you about the revision in your compensation package effective from {{effective_date}}.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Revised Compensation Details</h3>
          <ul style="list-style: none; padding-left: 0;">
            <li>Current CTC: {{current_ctc}}</li>
            <li>Revised CTC: {{revised_ctc}}</li>
            <li>Increment Percentage: {{increment_percentage}}%</li>
            <li>Effective Date: {{effective_date}}</li>
          </ul>
        </div>

        <p>This revision is based on your performance and contribution to the organization.</p>

        <p>Best regards,<br>
        {{sender_name}}<br>
        HR Manager<br>
        {{company_name}}</p>
      </div>
    `,
    fields: ['employee_name', 'current_ctc', 'revised_ctc', 'increment_percentage', 'effective_date', 'sender_name', 'company_name']
  },

  performanceAppraisal: {
    name: 'Performance Appraisal',
    subject: 'Performance Appraisal Review - {{review_period}}',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear {{employee_name}},</p>
        
        <p>Your performance appraisal for {{review_period}} has been completed. Here's a summary of your evaluation:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Performance Summary</h3>
          <ul>
            <li>Overall Rating: {{overall_rating}}</li>
            <li>Key Achievements: {{key_achievements}}</li>
            <li>Areas for Improvement: {{improvement_areas}}</li>
          </ul>
        </div>

        <p>Your next review is scheduled for {{next_review_date}}.</p>

        <p>Best regards,<br>
        {{manager_name}}<br>
        {{manager_position}}<br>
        {{company_name}}</p>
      </div>
    `,
    fields: ['employee_name', 'review_period', 'overall_rating', 'key_achievements', 'improvement_areas', 'next_review_date', 'manager_name', 'manager_position', 'company_name']
  },

  leadFollowUp: {
    name: 'Lead Follow-up',
    subject: 'Following up on our conversation - {{company_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear {{lead_name}},</p>
        
        <p>I hope this email finds you well. I'm following up on our {{conversation_type}} on {{last_contact_date}} regarding {{product_service}}.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Key Points Discussed:</h3>
          <ul>
            <li>{{discussion_point_1}}</li>
            <li>{{discussion_point_2}}</li>
            <li>{{discussion_point_3}}</li>
          </ul>
        </div>

        <p>I would be happy to schedule a follow-up {{meeting_type}} to discuss this further. Would {{proposed_date}} at {{proposed_time}} work for you?</p>

        <p>Best regards,<br>
        {{sender_name}}<br>
        {{sender_position}}<br>
        {{company_name}}<br>
        📱 {{sender_phone}}</p>
      </div>
    `,
    fields: ['lead_name', 'conversation_type', 'last_contact_date', 'product_service', 'discussion_point_1', 'discussion_point_2', 'discussion_point_3', 'meeting_type', 'proposed_date', 'proposed_time', 'sender_name', 'sender_position', 'sender_phone', 'company_name']
  },

  monthlyPayslip: {
    name: 'Monthly Payslip',
    subject: 'Payslip for {{month_year}} - {{company_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear {{employee_name}},</p>
        
        <p>Please find attached your salary slip for {{month_year}}.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Salary Details</h3>
          <ul style="list-style: none; padding-left: 0;">
            <li>Employee ID: {{employee_id}}</li>
            <li>Department: {{department}}</li>
            <li>Pay Period: {{month_year}}</li>
            <li>Payment Date: {{payment_date}}</li>
          </ul>
        </div>

        <p>The amount has been credited to your registered bank account. If you have any queries, please contact the HR department.</p>

        <p>Best regards,<br>
        {{sender_name}}<br>
        Payroll Department<br>
        {{company_name}}</p>
      </div>
    `,
    fields: ['employee_name', 'month_year', 'employee_id', 'department', 'payment_date', 'sender_name', 'company_name']
  },

  meetingInvitation: {
    name: 'Meeting Invitation',
    subject: '{{meeting_type}} Meeting - {{meeting_date}}',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear {{recipient_name}},</p>
        
        <p>You are invited to attend a {{meeting_type}} meeting.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Meeting Details</h3>
          <ul style="list-style: none; padding-left: 0;">
            <li>📅 Date: {{meeting_date}}</li>
            <li>⏰ Time: {{meeting_time}}</li>
            <li>📍 Location: {{meeting_location}}</li>
            <li>🔗 Meeting Link: {{meeting_link}}</li>
          </ul>
        </div>

        <h4 style="color: #2c3e50;">Agenda:</h4>
        <p>{{meeting_agenda}}</p>

        <p>Please confirm your attendance.</p>

        <p>Best regards,<br>
        {{sender_name}}<br>
        {{sender_position}}<br>
        {{company_name}}</p>
      </div>
    `,
    fields: ['recipient_name', 'meeting_type', 'meeting_date', 'meeting_time', 'meeting_location', 'meeting_link', 'meeting_agenda', 'sender_name', 'sender_position', 'company_name']
  },

  taskAssignment: {
    name: 'Task Assignment',
    subject: 'New Task Assignment: {{task_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear {{assignee_name}},</p>
        
        <p>A new task has been assigned to you.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Task Details</h3>
          <ul style="list-style: none; padding-left: 0;">
            <li>Task Name: {{task_name}}</li>
            <li>Priority: {{priority}}</li>
            <li>Due Date: {{due_date}}</li>
            <li>Project: {{project_name}}</li>
          </ul>
        </div>

        <h4 style="color: #2c3e50;">Description:</h4>
        <p>{{task_description}}</p>

        <p>Please update the task status as you progress.</p>

        <p>Best regards,<br>
        {{sender_name}}<br>
        Project Manager<br>
        {{company_name}}</p>
      </div>
    `,
    fields: ['assignee_name', 'task_name', 'priority', 'due_date', 'project_name', 'task_description', 'sender_name', 'company_name']
  }
}; 