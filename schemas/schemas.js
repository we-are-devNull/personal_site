import baseJoi from 'joi';
import sanitizeHtml from 'sanitize-html';

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} cannot contain HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if (clean !== value) return helpers.error('string.sanitize', { value });
                return clean;
            }
        }
    }
});

const joi = baseJoi.extend(extension);


const blogSchema = joi.object({     
    title: joi.string().required().escapeHTML(),
    body: joi.string().required().escapeHTML(),
});

export { blogSchema };