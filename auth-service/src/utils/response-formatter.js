const formatResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    status: statusCode,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

module.exports = { formatResponse };