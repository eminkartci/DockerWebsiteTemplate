

import { Router } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { User } from "../db";

// Router yapısı
const router = Router();
const protect = require("connect-ensure-login").ensureLoggedIn();

// username stünunu içerisinde arama yap
					// username parametresi al
const findByUsername = async (email: any, fn: any) => {

	// Bulmaya Çalış
	try {
		// "findOne" ile username olan satırı bul
		const kullanici = await User.findOne({
			where: { email:email },
		});

		// Eğer bulunduysa o bilgiyi geri gönder
		if (kullanici) return fn(null, kullanici);

		// bulunamadıysa Hata ver -> No user
		return fn(new Error("Kullanıcı Bulunamadı"), null);

	// Süreçte bağlanma sorunu yaşanırsa
	} catch (error) {
		// Hatayı döndür
		return fn(error, null);
	}
};


passport.serializeUser((kullanici: any, done: any) => {
	done(null, kullanici.email);
});

passport.deserializeUser(async (email: any, done: any) => {
	try {
		await findByUsername(email, (error: any, kullanici: any) => {
			if (error) {
				done(error, null);
			} else {
				done(null, kullanici.dataValues);
			}
		});
	} catch (error) {
		done(error, null);
	}
});

passport.use(
	new LocalStrategy(async (email, password, done) => {
		try {
			const kullanici: any = await User.findOne({ where: { email:email } });

			if (!kullanici) {
				return done(null, false);
			}

			//! HIGHLY DANGEROUS
			if (kullanici.sifre !== password) {
				return done(null, false);
			}

			return done(null, kullanici);
		} catch (err) {
			return done(err);
		}
	})
);

router.get("/", (req, res) => {
	return res.render("login");
});

router.get("/exit", (req, res) => {
	req.logout();
	return res.redirect("/");
});


router.post("/", (req, res, next) => {
	passport.authenticate("local", (error: any, kullanici: any, info: any) => {
		if (error) {
			return res.redirect("/login/error");
		} else if (!kullanici) {
			return res.redirect("/login/nouser");
		} else {
			return req.login(kullanici, function (err) {
				if (err) {
					return next(err);
				}
				return res.redirect("/dinamik_panel");
			});
		}
	})(req, res);
});

export default router;
export { passport, protect };
