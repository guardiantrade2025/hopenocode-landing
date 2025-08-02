// AI Service for HopeNocode Platform
class AIService {
    constructor() {
        this.conversations = new Map();
        this.codeTemplates = {
            'react-component': {
                template: `import React from 'react';

const {{componentName}} = ({ {{props}} }) => {
    return (
        <div className="{{className}}">
            {{content}}
        </div>
    );
};

export default {{componentName}};`,
                description: 'React functional component with props'
            },
            'html-page': {
                template: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        {{styles}}
    </style>
</head>
<body>
    {{content}}
    <script>
        {{script}}
    </script>
</body>
</html>`,
                description: 'Complete HTML page with CSS and JavaScript'
            },
            'api-endpoint': {
                template: `app.{{method}}('/api/{{endpoint}}', async (req, res) => {
    try {
        {{logic}}
        res.json({ success: true, data: {{response}} });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});`,
                description: 'Express.js API endpoint'
            }
        };
    }

    // Generate code based on description
    async generateCode(description, language = 'javascript', template = null) {
        try {
            // In a real implementation, this would call OpenAI or similar API
            const code = this.generateCodeFromTemplate(description, language, template);
            return {
                success: true,
                code,
                language,
                description
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate code from template
    generateCodeFromTemplate(description, language, templateType) {
        if (templateType && this.codeTemplates[templateType]) {
            const template = this.codeTemplates[templateType].template;
            return this.fillTemplate(template, description);
        }

        // Generate based on language
        switch (language.toLowerCase()) {
            case 'javascript':
                return this.generateJavaScript(description);
            case 'python':
                return this.generatePython(description);
            case 'html':
                return this.generateHTML(description);
            case 'css':
                return this.generateCSS(description);
            case 'react':
                return this.generateReactComponent(description);
            default:
                return this.generateJavaScript(description);
        }
    }

    // Fill template with values
    fillTemplate(template, description) {
        const words = description.split(' ');
        const componentName = words[0] || 'Component';
        const className = componentName.toLowerCase();
        
        return template
            .replace(/\{\{componentName\}\}/g, componentName)
            .replace(/\{\{className\}\}/g, className)
            .replace(/\{\{title\}\}/g, description)
            .replace(/\{\{content\}\}/g, `<div>${description}</div>`)
            .replace(/\{\{props\}\}/g, 'props')
            .replace(/\{\{styles\}\}/g, 'body { margin: 0; padding: 20px; }')
            .replace(/\{\{script\}\}/g, 'console.log("Hello World!");')
            .replace(/\{\{method\}\}/g, 'get')
            .replace(/\{\{endpoint\}\}/g, 'example')
            .replace(/\{\{logic\}\}/g, 'const data = { message: "Hello World" };')
            .replace(/\{\{response\}\}/g, 'data');
    }

    // Generate JavaScript code
    generateJavaScript(description) {
        return `// ${description}
function ${this.getFunctionName(description)}() {
    console.log("${description}");
    return true;
}

// Example usage
${this.getFunctionName(description)}();`;
    }

    // Generate Python code
    generatePython(description) {
        return `# ${description}
def ${this.getFunctionName(description)}():
    print("${description}")
    return True

# Example usage
if __name__ == "__main__":
    ${this.getFunctionName(description)}()`;
    }

    // Generate HTML
    generateHTML(description) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${description}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${description}</h1>
        <p>This is a generated HTML page based on your description.</p>
    </div>
</body>
</html>`;
    }

    // Generate CSS
    generateCSS(description) {
        return `/* ${description} */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 20px;
    margin: 10px 0;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.button {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}`;
    }

    // Generate React component
    generateReactComponent(description) {
        const componentName = this.getComponentName(description);
        return `import React from 'react';

const ${componentName} = ({ children, className = '' }) => {
    return (
        <div className={\`${componentName.toLowerCase()} \${className}\`}>
            <h2>${description}</h2>
            {children}
        </div>
    );
};

export default ${componentName};`;
    }

    // Get function name from description
    getFunctionName(description) {
        return description
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '') || 'exampleFunction';
    }

    // Get component name from description
    getComponentName(description) {
        const words = description.split(' ');
        return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') || 'Component';
    }

    // Chat functionality
    async chat(message, conversationId = null) {
        try {
            if (!conversationId) {
                conversationId = 'conv_' + Date.now();
            }

            if (!this.conversations.has(conversationId)) {
                this.conversations.set(conversationId, []);
            }

            const conversation = this.conversations.get(conversationId);
            conversation.push({ role: 'user', content: message });

            // Generate AI response
            const response = this.generateResponse(message, conversation);
            conversation.push({ role: 'assistant', content: response });

            return {
                success: true,
                response,
                conversationId,
                conversation
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate AI response
    generateResponse(message, conversation) {
        const lowerMessage = message.toLowerCase();
        
        // Simple response logic (in production, use OpenAI API)
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return 'Hello! I\'m your AI assistant. How can I help you with your coding project today?';
        }
        
        if (lowerMessage.includes('code') || lowerMessage.includes('generate')) {
            return 'I can help you generate code! Please describe what you want to create, and I\'ll generate the appropriate code for you.';
        }
        
        if (lowerMessage.includes('react') || lowerMessage.includes('component')) {
            return 'I can help you create React components! Just describe the component you need, and I\'ll generate the code for you.';
        }
        
        if (lowerMessage.includes('api') || lowerMessage.includes('endpoint')) {
            return 'I can help you create API endpoints! Describe the functionality you need, and I\'ll generate the Express.js code.';
        }
        
        return 'I\'m here to help you with your coding projects! You can ask me to generate code, explain concepts, or help with debugging. What would you like to work on?';
    }

    // Get available templates
    getTemplates() {
        return Object.entries(this.codeTemplates).map(([key, template]) => ({
            id: key,
            name: key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: template.description,
            template: template.template
        }));
    }

    // Get conversation history
    getConversation(conversationId) {
        return this.conversations.get(conversationId) || [];
    }

    // Clear conversation
    clearConversation(conversationId) {
        this.conversations.delete(conversationId);
        return { success: true };
    }
}

module.exports = new AIService(); 