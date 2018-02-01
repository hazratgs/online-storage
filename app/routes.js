module.exports = app => {

	

	// Если нет обработчиков, 404
	app.use((req, res, next) => {
		res.status(404)
		res.send({ "ok": false, "error_code": 404, "description": "Not found" })
	})

	// Возникла ошибка
	app.use((err, req, res, next) => {
		res.status(err.status || 500)
		res.send({ "ok": false, "error_code": 500, "description": err.message })
	})
}