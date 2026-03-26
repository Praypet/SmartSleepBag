const BASE_URL='http://localhost:8086'

export function request(config={}){
	return new Promise((resolve,reject)=>{
		uni.request({
			url:BASE_URL+config.url,
			data:config.data||{},
			success:res=>{
				if(res.data.code===200){
					resolve(res.data)
				}else if(res.data.code===400){
					console.log(res.data.errMsg)
					uni.showModal({
						showCancel:false,
						title:'错误提示',
						content:res.data.errMsg
					})
					reject(res.data)
				}else{
					uni.showToast({
						title:res.data.errMsg,
						icon:'none'
					})
					reject(res.data)
				}
			},
			fail:err=>{
				reject(err)
			}
		})
	})
}