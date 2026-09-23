import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000', // your Laravel app URL
  withCredentials: true,            // sends the session cookie
  withXSRFToken: true,              // axios 1.x auto-attaches XSRF-TOKEN header
})

export default api