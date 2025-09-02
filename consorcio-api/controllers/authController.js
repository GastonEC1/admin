const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const LoginHistory = require("../models/loginHistory");
const axios = require("axios");

exports.registerUser = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    user = new User({
      nombre,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    // Obtener la IP y guardar el historial de inicio de sesión
    const ipAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    try {
      const geoResponse = await axios.get(
        `https://ipapi.co/${ipAddress}/json/`
      );
      const { country_name, city, latitude, longitude } = geoResponse.data;

      const loginHistory = new LoginHistory({
        user: user.id,
        ipAddress: ipAddress,
        country: country_name,
        city: city,
        lat: latitude,
        lon: longitude,
      });

      await loginHistory.save();
    } catch (geoErr) {
      console.error(
        "Error al obtener la geolocalización o guardar el historial:",
        geoErr
      );
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        // Se añade el nombre del usuario a la respuesta
        res.json({ token, nombre: user.nombre });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

exports.getAuthenticatedUser = async (req, res) => {
  try {

    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "Usuario no autenticado." });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado." });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

exports.getLoginHistory = async (req, res) => {
    try {
        // req.user viene del middleware de autenticación
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: 'Usuario no autenticado.' });
        }

        const user = await User.findById(req.user.id).select('rol');
        if (!user || user.rol !== 'admin') {
            // Si el usuario no es un administrador, se deniega el acceso.
            return res.status(403).json({ msg: 'Acceso denegado. Solo administradores pueden ver el historial.' });
        }

        const history = await LoginHistory.find({})
            .populate('user', 'nombre') 
            .sort({ timestamp: -1 }); 

        res.json(history);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};