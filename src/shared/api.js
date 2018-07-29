import fetch from 'isomorphic-fetch'

export function getTitle(subTitle = '') {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/title?subTitle=${subTitle}`))
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error)
      return null
    });
}
