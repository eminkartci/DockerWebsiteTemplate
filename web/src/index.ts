//* Necessary imports
import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import redis from "redis";
import fs from "fs";

import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import session from "express-session";


try {
	require("dotenv").config();
} catch (_) {}

//* CONSTANTS
const PORT = process.env.PORT || 5001;

//* APP
const app = express();
app.set("trust proxy", 1);
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use("/assets", express.static(path.join(__dirname, "assets")));

//* Basic protection
app.use(helmet({
    contentSecurityPolicy: false,
  }));
app.use(cors());

//* Reqeust parsing
app.use(methodOverride());
app.use(cookieParser());

const dev = process.env.NODE_ENV !== "production";

//* Manage Session
if (dev) {
	app.use(
		session({
			secret: process.env.SESSION_KEY || "",
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: false,
				sameSite: "lax",
			},
		})
	);
} else {
	const RedisStore = require("connect-redis")(session);
	const redisClient = redis.createClient(process.env.REDIS_URL || "");
	app.use(
		session({
			store: new RedisStore({ client: redisClient, ttl: 1000 * 60 * 15 }),
			secret: process.env.SESSION_KEY || "",
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: true,
				sameSite: "none",
			},
		})
	);
}

//* App Start
import sequelize from "./db";
import authRouter, { passport, protect } from "./core/auth";
import { DATE } from "sequelize/types";

app.use(passport.initialize());
app.use(passport.session());

app.use("/login", express.urlencoded({ extended: true }), authRouter);


app.get("/",(req, res) => {
	return res.render("anasayfa");
});

app.get("/anasayfa",(req, res) => {
	return res.render("anasayfa");
});


app.use((err: Error, req: any, res: any, next: any) => {
	console.error(err);
	return res.status(500).json({
		code: "INTERNAL_ERROR",
		msg: err,
	});
});

sequelize
.sync({ force: process.env.NODE_ENV != "production" && false })
	.then(async () => {
		app.listen(PORT, () => console.log(`Listening on ${PORT}`));
	});
