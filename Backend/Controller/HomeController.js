const Home = (req, res) => {
    res.status(200).json({
      message: "Hi this is home verify by token",
      user: req.user,
    });
  };
  
  module.exports = Home;