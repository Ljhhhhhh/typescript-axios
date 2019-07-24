import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from './types'
import { parseHeaders } from './helpers/headers'
import { createError } from './helpers/error'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const { url, method = 'get', data = null, headers, responseType, timeout } = config

    // https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest
    const request = new XMLHttpRequest()

    // 响应数据类型
    if (responseType) {
      request.responseType = responseType
    }

    // 超时时间
    if (timeout) {
      request.timeout = timeout
    }

    // 初始化请求
    request.open(method.toUpperCase(), url, true)

    // 监听状态改变
    request.onreadystatechange = function handleLoad() {
      if (request.readyState !== 4) return // XMLHttpRequest代理当前所处的状态不是完成状态，直接返回
      if (request.status === 0) return // 请求未完成，直接返回

      // 获取返回的响应头，并使用parseHeaders函数进行格式处理
      const responseHeaders = parseHeaders(request.getAllResponseHeaders())
      // 根据responseType设置需要获取的数据类型
      const responseData = responseType !== 'text' ? request.response : request.responseText
      // 整合返回的对象
      const response: AxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      }
      handleResponse(response)
    }

    // 错误处理
    request.onerror = function handleError() {
      reject(createError('Netword Error', config, null, request))
    }

    // 超时处理
    request.ontimeout = function handleTimeout() {
      reject(createError(`Timeout of ${timeout}ms exceeded`, config, 'ECONNABORTED', request))
    }

    // 处理headers
    Object.keys(headers).forEach(name => {
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        request.setRequestHeader(name, headers[name])
      }
    })

    // 发送 HTTP 请求
    request.send(data)

    function handleResponse(response: AxiosResponse): void {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
