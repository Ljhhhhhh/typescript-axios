import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from './types'
import xhr from './xhr'
import { buildUrl } from './helpers/url'
import { transformRequest, transformResponse } from './helpers/data'
import { processHeaders } from './helpers/headers'

function axios(config: AxiosRequestConfig): AxiosPromise {
  processConfig(config)
  return xhr(config).then(res => {
    // 格式化返回的数据
    return transformResponseData(res)
  })
}

function processConfig(config: AxiosRequestConfig): void {
  // 格式化请求地址
  config.url = transformUrl(config)
  // 格式化请求头
  config.headers = transformHeaders(config)
  // 格式化请求数据
  config.data = transformRequestData(config)
}

function transformUrl(config: AxiosRequestConfig): string {
  const { params, url } = config
  return buildUrl(url, params)
}

function transformRequestData(config: AxiosRequestConfig): any {
  return transformRequest(config.data)
}

function transformHeaders(config: AxiosRequestConfig): any {
  const { headers = {}, data } = config
  return processHeaders(headers, data)
}

function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transformResponse(res.data)
  return res
}

export default axios
