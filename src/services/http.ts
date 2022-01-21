import Cookies from 'universal-cookie';
import Axios from 'axios'

const cookies = new Cookies();

export const getToken = () => {
  return cookies.get('_hrm_airclass_key');
}

const appId = 'ceshi'

export const http = Axios.create({
  baseURL: `toybox/studio/web/admin/v1/apps/${appId}`,
  headers: { 'Authorization': getToken() }
})
