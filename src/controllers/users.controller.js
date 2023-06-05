//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
// Imports //
//-----------------------------------------------------------------------------------------------------//

const User = require("../models/user/user.model")
const { getToken, COOKIE_OPTIONS, getRefreshToken } = require("../authenticate")

//-----------------------------------------------------------------------------------------------------//
// Logic
//-----------------------------------------------------------------------------------------------------//

console.log("Inside users.controller module")


async function postSignUp(req, res, next) {
    console.log("Inside postSignup function");

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
            // esta linea toma del request body, el username y el password, y crea un nuevo User, segun el schema. Luego lo registra tambien. 
            const user = await User.register(new User({ username: req.body.username }), req.body.password); // de esta linea no entiendo porque usa username: req.body.username
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName || "";
            
            const token = getToken({ _id: user._id });
            
            const refreshToken = getRefreshToken({ _id: user._id });
            user.refreshToken.push({ refreshToken });
            
            await user.save();
            
            res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
            res.send({ success: true, token });
        } catch (err) {
            res.statusCode = 500;
            res.send(err);
        }
    }
}


async function postLogin(req, res, next) {
    try {
        const token = getToken({ _id: req.user._id });// igual
        const refreshToken = getRefreshToken({ _id: req.user._id });  // igual

        const user = await User.findById(req.user._id);
        user.refreshToken.push({ refreshToken }); // igual
        await user.save();

        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS); // igual
        res.send({ success: true, token }); // igual
    } catch (err) {
        res.statusCode = 500; // igual
        res.send(err); // igual
    }
}

async function postRefreshToken( req, res, next) {

}

function getUser( req, res, next) {
    res.send(req.user)
}

//-----------------------------------------------------------------------------------------------------//
// Exports
//-----------------------------------------------------------------------------------------------------//

module.exports = {
    postSignUp,
    postLogin,
    postRefreshToken,
    getUser
}



/*

Dejo copiados aca los originales del tutorial, que no usaban promesas hasta donde entiendo... 
para comprarlos con las conversiones q me hizo chatGPT y aprender la diferencia.

Codigo Original de postLogin

async function postLogin (req, res, next) {
    const token = getToken({ _id: req.user._id }) //igual
    const refreshToken = getRefreshToken({ _id: req.user._id }) //igual
    User.findById(req.user._id).then( // ********************* esta linea y la de abajo, cambian en 1.
      user => { // *********************
        user.refreshToken.push({ refreshToken }) // igual
        user.save((err, user) => { 
          if (err) {// esto puede ser el try.
            res.statusCode = 500 // igual.
            res.send(err) // igual
          } else { // esto puede ser el catch.
            res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS) // igual
            res.send({ success: true, token }) // igual.
          }
        })
      },
      err => next(err) // ******************esta esta de mas.
    )
}


Codigo original de postSingUp:

async function postSignUp (req, res, next) {
    console.log("Inside postSingup function 💡💡💡💡💡")
  
    // Verify that first name is not empty
    //if empty..
    if (!req.body.firstName) {
        res.statusCode = 500
        res.send({
            name: "FirstNameError",
            message: "The first name is required",
        })
    //if THERE IS a body.firstName:
    } else {
        User.register( 
            // create new user using the username in the body of the request.
            new User({ username: req.body.username }),
            //??
            req.body.password,
            //
            (err, user) => {
                if (err) {
                    res.statusCode = 500
                    res.send(err)
                } else {
                    user.firstName = req.body.firstName
                    user.lastName = req.body.lastName || ""
                    const token = getToken({ _id: user._id })
                    const refreshToken = getRefreshToken({ _id: user._id })
                    user.refreshToken.push({ refreshToken })
                    user.save((err, user) => {
                        if (err) {
                            res.statusCode = 500
                            res.send(err)
                        } else {
                            res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
                            res.send({ success: true, token })
                        }
                    })
                }
            }
        )
    }
}
*/