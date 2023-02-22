const ironOptions = {
	cookieName: 'siwe',
	password: process.env.IRON_SESS_PASS,
	cookieOptions: {
		secure: process.env.NODE_ENV === 'production',
	},
};

export default ironOptions;
