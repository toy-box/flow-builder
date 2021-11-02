import Cookies from 'universal-cookie';
import Axios from 'axios'

const cookies = new Cookies();

export const getToken = () => {
  return cookies.get('_hrm_airclass_key');
}

export const http = Axios.create({
  baseURL: 'toolbox/studio/web/admin/v1',
  headers: { 'Authorization': getToken() }
})
