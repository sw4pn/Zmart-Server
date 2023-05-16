const sendResponse = (
  req,
  res,
  statusCode,
  successCode,
  message,
  data = {}
) => {
  if (res.headerSent) {
    console.log("Headers already sent.");
    return;
  }

  const obj = {
    success: successCode,
    message: message,
    ...data,
  };

  return res.status(statusCode).json(obj);
};

export default sendResponse;
