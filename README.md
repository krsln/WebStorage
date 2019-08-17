# WebStorage
tested on angular 6.* - 9.*

to store some data || Local, Session, Cookie 

using...


    console.log(WebStorage.Set(StorageType.Local, 'TestLocal', {abc:'Test Local Value'}));
    WebStorage.Remove(StorageType.Local, 'TestLocal');

    console.log(WebStorage.Set(StorageType.Session, 'TestSession', 'Test Session Value'));
    WebStorage.Remove(StorageType.Session, 'TestSession');

    console.log(WebStorage.Set(StorageType.Cookie, 'TestCookie', 'Test Cookie Value'));
    WebStorage.Remove(StorageType.Cookie, 'TestCookie');
