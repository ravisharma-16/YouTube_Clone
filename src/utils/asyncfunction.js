// const asyncfunction = (funct) => async (req,res,next) => 
// {
//   try {
//     await funct(req,res,next)
//   } catch (error) {
//     res.status(error.code || 500).json({
//         success : false,
//         message : error.message
//     })
//   }
// }

// export {asyncfunction}

export const asyncfunction = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      const status = typeof err.statusCode === "number" && err.statusCode >= 100 && err.statusCode < 600
        ? err.statusCode
        : 500;

      return res.status(status).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    });
  };
};
