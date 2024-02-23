import joi from 'joi';

const blogSchema = joi.object({     
    title: joi.string().required(),
    body: joi.string().required(),
});

export { blogSchema };