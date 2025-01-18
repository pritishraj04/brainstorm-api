const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors =
        error.details?.map((detail) => ({
          key: detail.path.join("."),
          message: detail.message,
        })) || [];
      if (errors.length) {
        return res.status(400).json(errors);
      }
    }
    next();
  };
};

export default validate;
