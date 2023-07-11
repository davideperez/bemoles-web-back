const jwt = require("jsonwebtoken");
const User = require("../models/user/user.model");
const {
  getToken,
  COOKIE_OPTIONS,
  getRefreshToken,
} = require("../authenticate");

async function register(req, res, next) {
  // Verify that first name is not empty
  if (!req.body.firstName) {
    console.log("First name is empty");
    res.statusCode = 500;
    res.send({
      name: "FirstNameError",
      message: "The first name is required",
    });
  } else {
    console.log("First name is not empty");

    try {
      // se toman el username y el password del body del request, se CREA y se REGISTRA en la db, un nuevo User.
      const user = await User.register(
        new User({ username: req.body.username }),
        req.body.password
      );

      //se le agregan los campos firstname y lastname.
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName || "";

      //la funcion getToken de authenticate.js, llama a jwt.sign(), q devuelve.... un token??
      const token = getToken({ _id: user._id });

      // la funcion getRefreshToken de authenticate.js, es exactamente igual a la de getToken, pero difieren el expiry. llama a jwt.sign()
      const refreshToken = getRefreshToken({ _id: user._id });
      user.refreshToken.push({ refreshToken });

      //salva la variable user, en la db en mongo db.
      await user.save();

      //se envia la cookie. se la nombra refreshToken, se manda el refreshTokedn y las opciones de cookie.
      res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
      //se envia la respuesta HTTP:en este caso con un token de acceso.
      res.send({ success: true, token });
    } catch (err) {
      res.statusCode = 500;
      res.send(err);
    }
  }
}

async function login(req, res, next) {
  try {
    const token = getToken({ _id: req.user._id }); // igual
    const refreshToken = getRefreshToken({ _id: req.user._id }); // igual

    const user = await User.findById(req.user._id);
    user.refreshToken.push({ refreshToken }); // igual
    await user.save();

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS); // igual
    console.log({refreshToken})
    res.send({
      success: true,
      token,
      firstName: user.firstName,
      lastName: user.lastName,
    }); // igual
  } catch (err) {
    res.statusCode = 500; // igual
    res.send(err); // igual
  }
}

async function postRefreshToken(req, res, next) {
  try {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;

    console.log({refreshToken})

    if (refreshToken) {
      try {
        //se pasa del token codificado a uno decodificado y se guarda en payload.
        const payload = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        console.log(JSON.stringify(payload, null, 2));
        //
        const userId = payload._id;
        //
        const user = await User.findOne({ _id: userId });

        if (user) {
          // Find the refresh token against the user record in database
          const tokenIndex = user.refreshToken.findIndex(
            (item) => item.refreshToken === refreshToken
          );

          if (tokenIndex === -1) {
            res.statusCode = 401;
            res.send("Unauthorized");
          } else {
            const token = getToken({ _id: userId });
            // If the refresh token exists, then create new one and replace it.
            const newRefreshToken = getRefreshToken({ _id: userId });
            user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken };
            await user.save();
            res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
            res.send({ success: true, token });
          }
        } else {
          res.statusCode = 401;
          res.send("Unauthorized");
        }
      } catch (err) {
        res.statusCode = 401;
        res.send("Unauthorized");
      }
    } else {
      res.statusCode = 401;
      res.send("Unauthorized");
    }
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;

    const user = await User.findById(req.user._id);
    const tokenIndex = user.refreshToken.findIndex(
      (item) => item.refreshToken === refreshToken
    );

    if (tokenIndex !== -1) {
      user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove();
    }

    await user.save();

    const cookieOptions = {
      httpOnly: true,
      sameSite: false,
      maxAge: 0,
    };

    // res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.cookie("refreshToken", '', cookieOptions);
    res.send({ success: true });
  } catch (error) {
    res.statusCode = 500;
    res.send(error);
  }
}

function getUser(req, res, next) {
  res.send(req.user);
}

module.exports = {
  register,
  login,
  postRefreshToken,
  logout,
  getUser,
};
