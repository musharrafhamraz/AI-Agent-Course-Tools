-- Enhanced AI Tools Database with Task Category Mappings
-- This comprehensive database maps AI tools to specific work tasks

-- Clear existing data
TRUNCATE TABLE ai_tools CASCADE;

-- Productivity & Writing Tools
INSERT INTO ai_tools (tool_name, tool_category, description, official_url, difficulty_level, is_free, pricing_info) VALUES
('ChatGPT', 'productivity', 'Advanced AI assistant for writing, analysis, brainstorming, and task automation. Excellent for drafting reports, emails, and documentation.', 'https://chat.openai.com', 'beginner', false, 'Free tier + $20/month Pro'),
('Claude', 'productivity', 'Anthropic AI assistant specialized in analysis, research, and long-form writing. Great for policy documents and detailed reports.', 'https://claude.ai', 'beginner', true, 'Free tier + $20/month Pro'),
('Grammarly', 'writing', 'AI-powered writing assistant for grammar, clarity, and tone. Perfect for professional communications and documentation.', 'https://grammarly.com', 'beginner', true, 'Free tier + $12/month Premium'),
('Jasper', 'writing', 'AI content creation for marketing materials, reports, and business communications.', 'https://jasper.ai', 'intermediate', false, 'Starting at $39/month'),
('Notion AI', 'productivity', 'AI-powered workspace for notes, documentation, and team collaboration with smart writing assistance.', 'https://notion.so', 'beginner', false, '$10/month add-on'),
('Copy.ai', 'writing', 'AI copywriting tool for creating emails, reports, proposals, and business documents quickly.', 'https://copy.ai', 'beginner', true, 'Free tier + $49/month Pro'),

-- Meeting & Communication Tools
('Otter.ai', 'communication', 'AI meeting transcription and note-taking. Automatically transcribes meetings and generates summaries with action items.', 'https://otter.ai', 'beginner', true, 'Free tier + $8.33-20/month Premium'),
('Fireflies.ai', 'communication', 'AI meeting assistant that records, transcribes, and analyzes meetings across all platforms with searchable transcripts.', 'https://fireflies.ai', 'beginner', true, 'Free tier + $10/month Pro'),
('Fathom', 'communication', 'Free AI meeting note taker that summarizes calls and extracts action items automatically.', 'https://fathom.video', 'beginner', true, 'Free forever'),
('Fellow', 'communication', 'AI meeting management with agendas, notes, and action items. Enterprise-ready with security controls.', 'https://fellow.app', 'intermediate', false, '$7-10/user/month'),

-- Data Analysis & Reporting Tools
('Julius AI', 'data-analysis', 'Conversational AI for data analysis. Upload datasets and ask questions in plain language to generate insights and visualizations.', 'https://julius.ai', 'beginner', false, '$20/month'),
('ChatGPT Advanced Data Analysis', 'data-analysis', 'Built-in data analysis feature of ChatGPT Plus. Analyze CSV/Excel files, create charts, and generate statistical reports.', 'https://chat.openai.com', 'beginner', false, '$20/month with Plus'),
('Tableau with Einstein AI', 'data-analysis', 'Industry-leading data visualization with AI-powered insights, predictions, and automated dashboard creation.', 'https://tableau.com', 'advanced', false, 'Starting at $70/user/month'),
('Microsoft Power BI with Copilot', 'data-analysis', 'Business intelligence platform with AI copilot for creating reports, dashboards, and data narratives in natural language.', 'https://powerbi.microsoft.com', 'intermediate', true, 'Free tier + $10-20/user/month Pro'),
('Hex', 'data-analysis', 'Collaborative data workspace with AI assist for SQL, Python analysis, and automated reporting workflows.', 'https://hex.tech', 'advanced', true, 'Free tier + $49/user/month Team'),
('MonkeyLearn', 'data-analysis', 'No-code AI for text analysis and data visualization. Perfect for analyzing survey responses and feedback.', 'https://monkeylearn.com', 'beginner', true, 'Free tier + $299/month'),

-- Document Management & Automation
('Zapier', 'automation', 'AI-powered workflow automation connecting 5000+ apps. Automate repetitive tasks without coding.', 'https://zapier.com', 'beginner', true, 'Free tier + $19.99/month Starter'),
('Make (Integromat)', 'automation', 'Visual automation platform for connecting apps and automating complex workflows with AI capabilities.', 'https://make.com', 'intermediate', true, 'Free tier + $9/month Core'),
('Documenso', 'document', 'Open-source document signing automation. AI-assisted document preparation and signature workflows.', 'https://documenso.com', 'beginner', true, 'Free tier + $30/month'),
('Coda', 'productivity', 'All-in-one doc platform with AI for creating interactive documents, automating workflows, and building team hubs.', 'https://coda.io', 'intermediate', true, 'Free tier + $10/user/month Pro'),

-- HR & Administrative Tools
('Textio', 'hr-tools', 'AI writing platform for job descriptions, performance reviews, and HR communications with bias detection.', 'https://textio.com', 'beginner', false, 'Custom pricing'),
('Lattice', 'hr-tools', 'People management platform with AI-powered performance reviews, goal setting, and engagement surveys.', 'https://lattice.com', 'intermediate', false, 'Starting at $11/user/month'),
('Personio', 'hr-tools', 'All-in-one HR software with AI for recruitment, onboarding, attendance, and payroll automation.', 'https://personio.com', 'intermediate', false, 'Custom pricing'),

-- Project Management
('ClickUp AI', 'project-management', 'Project management with AI assistant for task descriptions, status updates, and automated summaries.', 'https://clickup.com', 'beginner', true, 'Free tier + $7/user/month'),
('Motion', 'project-management', 'AI-powered calendar and task manager that automatically schedules your work based on priorities and deadlines.', 'https://usemotion.com', 'beginner', false, '$19/month'),
('Asana Intelligence', 'project-management', 'Work management platform with AI features for smart goals, automated workflows, and project insights.', 'https://asana.com', 'beginner', true, 'Free tier + $10.99/user/month'),

-- Presentation & Creative
('Gamma', 'presentation', 'AI-powered presentation creator. Generate professional slide decks from text prompts in minutes.', 'https://gamma.app', 'beginner', true, 'Free tier + $10/month Pro'),
('Beautiful.ai', 'presentation', 'AI presentation software with smart templates that auto-adjust as you add content.', 'https://beautiful.ai', 'beginner', false, '$12/month Pro'),
('Canva AI', 'creative', 'Design platform with AI features for creating graphics, presentations, documents, and social media content.', 'https://canva.com', 'beginner', true, 'Free tier + $12.99/month Pro'),
('Midjourney', 'creative', 'AI image generation for creating custom graphics, diagrams, and visual content for presentations.', 'https://midjourney.com', 'intermediate', false, '$10-60/month'),

-- Email & Communication
('Superhuman', 'communication', 'AI-powered email client with smart triage, auto-generated responses, and productivity features.', 'https://superhuman.com', 'beginner', false, '$30/month'),
('SaneBox', 'communication', 'AI email management that filters, sorts, and summarizes emails automatically.', 'https://sanebox.com', 'beginner', false, '$7/month'),
('EmailTree', 'communication', 'AI for automated email responses, routing, and classification. Perfect for high-volume email management.', 'https://emailtree.ai', 'intermediate', false, 'Custom pricing'),

-- Research & Knowledge Management
('Perplexity AI', 'research', 'AI-powered search engine with citations. Get research summaries with source links instantly.', 'https://perplexity.ai', 'beginner', true, 'Free tier + $20/month Pro'),
('Elicit', 'research', 'AI research assistant for finding, summarizing, and extracting data from academic papers and reports.', 'https://elicit.org', 'beginner', true, 'Free tier + $10/month Plus'),
('Mem', 'productivity', 'AI-powered note-taking that automatically organizes and surfaces relevant information when you need it.', 'https://mem.ai', 'beginner', false, '$8.33/month'),

-- Specialized Government/Administrative Tools
('Salesforce Einstein', 'crm', 'AI-powered CRM for case management, citizen services, and relationship tracking with predictive analytics.', 'https://salesforce.com/einstein', 'advanced', false, 'Starting at $25/user/month'),
('ServiceNow AI', 'service-management', 'AI-powered platform for IT service management, HR case management, and workflow automation.', 'https://servicenow.com', 'advanced', false, 'Custom enterprise pricing');

-- Add task category mappings (using a JSON approach in description for demo)
-- In production, this would be a separate mapping table

COMMENT ON TABLE ai_tools IS 'Comprehensive AI tools database with task category mappings for intelligent learning plan generation';
