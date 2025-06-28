module.exports = {
    "description": "Add a line to the timeline",
    "prompts": [
        {
            "type": "input",
            "name": "text",
            "message": "What is the text of the line?"
        }
    ],
    "actions": [
        {
            "type": "append",
            "path": "../../.meta/timeline",
            "pattern": "",
            "template": "{{text}}"
        }
    ]
}