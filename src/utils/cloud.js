async function call_api(name, args = {}) {
	let token = localStorage.getItem('token');
	return null;
	// return axios.post("/api", {
	//     api: name,
	//     args,
	//     token
	// }).then(res => {
	//     let api_res = {
	//         ...res.data,
	//         api_call_success: true
	//     };
	//     if (api_res.success && api_res?.data?.token) {
	//         localStorage.setItem('token', api_res.data.token);
	//     }
	//     return api_res;
	// }).catch(err => {
	//     console.log("error:", err);
	//     return {
	//         success: false,
	//         api_call_success: false,
	//         error_message: "网络错误"
	//     };
	// });
}

export {
	call_api
}