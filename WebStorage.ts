import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {DOCUMENT, isPlatformBrowser, isPlatformServer} from '@angular/common';

@Injectable({providedIn: 'root'})
export class WebStorage {

  constructor(@Inject(DOCUMENT) private document: Document,
              @Inject(PLATFORM_ID) private platformId: any,
  ) {
    // console.log('isPlatformBrowser', isPlatformBrowser(this.platformId), this.document);
  }

  Set(storageType: StorageType, key: string, obj: any, expMin: number = 60): any {
    // const expires = new Date(year, month, day, hours, minutes, seconds, milliseconds);
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + expMin);
    const data = {ExpiresAt: Date.parse(expires.toString()), Data: obj};
    // console.log('Set isPlatformBrowser', isPlatformBrowser(this.platformId), this.document);

    if (isPlatformBrowser(this.platformId)) {
      switch (storageType) {
        case StorageType.Cookie:
          const expireCookie: string = 'expires=' + new Date(data.ExpiresAt).toUTCString();
          this.SetCookie(key, JSON.stringify(data), expireCookie, '/');
          break;
        case StorageType.Local:
          localStorage.setItem(key, JSON.stringify(data));
          break;
        case StorageType.Session:
          sessionStorage.setItem(key, JSON.stringify(data));
          break;
      }
    }

    return this.Get(storageType, key);
  }

  Get(storageType: StorageType, key: string): any {
    // console.log('Get isPlatformBrowser', isPlatformBrowser(this.platformId), this.document);
    let data = null;
    if (isPlatformBrowser(this.platformId)) {
      switch (storageType) {
        case StorageType.Cookie:
          data = this.GetCookie(key);
          break;
        case StorageType.Local:
          data = window.localStorage.getItem(key);
          break;
        case StorageType.Session:
          data = window.sessionStorage.getItem(key);
          break;
      }
    }
    // console.log('Get', data);

    if (data !== 'undefined' && data !== undefined && data !== null) {
      return this.CheckData(storageType, key, data);
    }
    return null;
  }

  Remove(storageType: StorageType, key: string) {
    switch (storageType) {
      case StorageType.Cookie:
        this.RemoveCookie(key, '/');
        console.log(key, ' Cookie expired');
        break;
      case StorageType.Local:
        window.localStorage.removeItem(key);
        console.log(key, 'localStorage expired');
        break;
      case StorageType.Session:
        window.sessionStorage.removeItem(key);
        console.log(key, 'session expired');
        break;
    }
  }

  //#region Cookie

  private GetCookie(key: string) {
    const cookies: Array<string> = this.document.cookie.split(';');
    const cookieName = `${key}=`;

    let data = cookies.map(x => x.replace(/^\s+/g, ''))
      .find(x => x.indexOf(cookieName) === 0);

    data = data ? data.substring(cookieName.length, data.length) : null;
    return data;
  }

  private SetCookie(key: string, data: string, expireCookie: string, path: string = '/') {
    if (isPlatformBrowser(this.platformId)) {
      this.document.cookie = key + '=' + data + '; ' + expireCookie + (path.length > 0 ? '; path=' + path : '');
    }
  }

  private RemoveCookie(key: string, path: string = '/') {
    const d: Date = new Date();
    d.setTime(d.getTime() + -1 * 24 * 60 * 60 * 1000);
    // console.log(d);
    const data = '';
    const expireCookie: string = 'expires=' + d.toUTCString();
    if (isPlatformBrowser(this.platformId)) {
      this.document.cookie = key + '=' + data + '; ' + expireCookie + (path.length > 0 ? '; path=' + path : '');
    }
  }

  //#endregion

  private CheckData(storageType: StorageType, key: string, obj: any) {
    const sessionObject = JSON.parse(obj);
    // console.log(key, sessionObject, new Date(sessionObject.ExpiresAt));
    if (Date.parse(new Date().toString()) < sessionObject.ExpiresAt) {
      return sessionObject.Data;
    } else {
      this.Remove(storageType, key);
      return null;
    }
  }

}

export enum StorageType {
  Local,
  Session,
  Cookie
}

/* Usage
    constructor(private webStorage: WebStorage) {}

    webStorage.Set(StorageType.Local, 'Auth', response.Customer, 60);
    this.Customer = webStorage.Get(StorageType.Local, 'Auth');

    window.localStorage - stores data with no expiration date
    window.sessionStorage - stores data for one session (data is lost when the browser tab is closed)
    sessionStorage.clear(); // Remove all saved data from sessionStorage
*/
