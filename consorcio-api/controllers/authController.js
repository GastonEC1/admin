const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const LoginHistory = require("../models/loginHistory");
const axios = require("axios");

exports.registerUser = async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    user = new User({
      nombre,
      email,
      password,
      rol,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        rol: user.rol,
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

    // 📌 IP real (soporte para proxy / Render / Vercel / etc.)
    const ipAddressHeader = req.headers["x-forwarded-for"];
    const ipAddress = ipAddressHeader
      ? ipAddressHeader.split(",")[0].trim()
      : req.socket.remoteAddress;

    let lat = null;
    let lon = null;
    let country_name = null;
    let city = null;
    let org = null;

    try {
      // 🚀 Llamada a IPinfo
      const response = await axios.get(
        `https://ipinfo.io/${ipAddress}?token=${process.env.IPINFO_TOKEN}`
      );

      const data = response.data;
      console.log("Datos de IPinfo:", data);

      if (data.loc) {
        const [latitude, longitude] = data.loc.split(",");
        lat = latitude;
        lon = longitude;
        city = data.city || null;
        country_name = data.country || null;
        org = data.org || null;
      }
    } catch (geoErr) {
      console.error("Error al obtener la geolocalización:", geoErr.message);
    }

    const loginHistory = new LoginHistory({
      user: user.id,
      ipAddress: ipAddress,
      country: country_name,
      city: city,
      lat: lat,
      lon: lon,
      org: org,
      timestamp: new Date(),
    });

    await loginHistory.save();

    const payload = {
      user: {
        id: user.id,
        rol: user.rol,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
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
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "Usuario no autenticado." });
    }

    const user = await User.findById(req.user.id).select("rol");
    if (!user || user.rol !== "admin") {
      return res
        .status(403)
        .json({
          msg: "Acceso denegado. Solo administradores pueden ver el historial.",
        });
    }

    const history = await LoginHistory.find({})
      .populate("user", "nombre")
      .sort({ timestamp: -1 });

    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};
