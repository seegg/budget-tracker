export const errorHandler = async (err: any, res: any, next: any) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({ message: err.message });
  } else {
    console.log(err);
    res.status(500).json({ message: 'something went wrong' });
  }
};