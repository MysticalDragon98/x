# Mailgun Feature

Use the following rules whenever you are interacting with the Mailgun functionalities

1) Mailgun is used for sending emails, either via Mailgun templates or inline HTML (Handlebars)
2) Use `MailgunFeature.sendByTemplate()` when using a pre-defined Mailgun template with variables
3) Use `MailgunFeature.sendByHtml()` when rendering HTML from a Handlebars `.hbs` template string with data
4) Handlebars templates belong to modules and are stored in src/modules/{module}/mailgun/templates/{name}.mailgun-template.hbs
5) Creation of templates must always be done using `x mailgun:template {module} {name}`, this will create the scaffolding. NEVER CREATE TEMPLATES OTHER WAY
6) The `from` field is optional in both send methods and defaults to the `MAILGUN_FROM` environment variable
7) Required environment variables: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM` — these are configured via the env feature
