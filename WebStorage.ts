export class WebStorage {
  /*
   window.localStorage - stores data with no expiration date
   window.sessionStorage - stores data for one session (data is lost when the browser tab is closed)
   sessionStorage.clear(); // Remove all saved data from sessionStorage
   */

  static Set(storageType: StorageType, key: string, obj: any, expMin: number = 60): any {
    // const expires = new Date(year, month, day, hours, minutes, seconds, milliseconds);
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + expMin);
    const data = {
      ExpiresAt: Date.parse(expires.toString()),
      Data: obj
    };

    if (storageType === StorageType.Local) {
      localStorage.setItem(key, JSON.stringify(data));
    } else if (storageType === StorageType.Session) {
      sessionStorage.setItem(key, JSON.stringify(data));
    } else if (storageType === StorageType.Cookie) {
      const path = '/';
      const expireCookie: string = 'expires=' + new Date(data.ExpiresAt).toUTCString();
      document.cookie = key + '=' + JSON.stringify(data) + '; ' + expireCookie + (path.length > 0 ? '; path=' + path : '');
    }

    return this.Get(storageType, key);
  }

  static Get(storageType: StorageType, key: string): any {
    let data = null;
    if (storageType === StorageType.Local) {
      data = localStorage.getItem(key);
    } else if (storageType === StorageType.Session) {
      data = sessionStorage.getItem(key);
    } else if (storageType === StorageType.Cookie) {
      const cookies: Array<string> = document.cookie.split(';');
      const cookieName = `${key}=`;

      data = cookies
        .map(x => x.replace(/^\s+/g, ''))
        .find(x => x.indexOf(cookieName) === 0);

      if (data) {
        data = data.substring(cookieName.length, data.length);
      } else {
        data = null;
      }
    }

    if (data !== 'undefined' && data !== undefined && data !== null) {
      return this.CheckData(storageType, key, data);
    }
    return null;
  }

  static Remove(storageType: StorageType, key: string) {
    if (storageType === StorageType.Local) {
      localStorage.removeItem(key);
      console.log(key, 'localStorage expired');
    } else if (storageType === StorageType.Session) {
      sessionStorage.removeItem(key);
      console.log(key, 'session expired');
    } else if (storageType === StorageType.Cookie) {
      this.SetCookie(key, '', -1);
      console.log(key, ' Cookie expired');
    }
  }

  private static SetCookie(name: string, value: string, expireDays: number, path: string = '') {
    const d: Date = new Date();
    d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
    // console.log(d);
    const expires: string = 'expires=' + d.toUTCString();
    document.cookie = name + '=' + value + '; ' + expires + (path.length > 0 ? '; path=' + path : '');
  }

  private static CheckData(storageType: StorageType, key: string, obj: any) {
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

