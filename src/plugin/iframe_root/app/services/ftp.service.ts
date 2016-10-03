import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

//import 'rxjs/Rx';

import { Folder } from './folder';

import { KBaseIntegration } from './kbase-integration.service';
import { KBaseAuth } from '../services/kbase-auth.service';


@Injectable()

export class FtpService {
    ftpUrl: string;

    // this one is just for testing of local changes ... 
    reqOptions; // temp storage of auth header

    selectedFiles = []; // files selected in UI
    selectedSets = []; // files selected in UI


    files = {};         // file lists loaded and cached

    // default selected folder
    selectedFolder: Folder;

    selectedPath = new Subject<string>();
    selectedFileCount = new Subject<number>();
    selectedSetCount = new Subject<number>();
    selectedType = new BehaviorSubject<Object>(false);

    selectedPath$ = this.selectedPath.asObservable();
    selectedFileCount$ = this.selectedFileCount.asObservable();
    selectedSetCount$ = this.selectedSetCount.asObservable();

    selectedType$ = this.selectedType.asObservable();

    constructor(private http: Http,
        private auth: KBaseAuth,
        private integration: KBaseIntegration) {
        let headers = new Headers({ 'Authorization': auth.getToken() });
        this.reqOptions = new RequestOptions({ headers: headers });

        this.ftpUrl = integration.getConfig().services.ftp.url;

        this.selectedFolder = {
            name: integration.getUsername(),
            path: '/' + integration.getUsername()
        }
    }

    getRootDirectory() {
        return this.integration.getConfig().services.ftp.root;
    }

    list(path?: string) {
        path = path ? path : '/' + this.integration.getUsername();
        return this.http.get(this.ftpUrl + '/list/' + path, this.reqOptions)
            .map(res => {
                let files = [],
                    folders = [];

                res.json().forEach(file => {
                    if (file.isFolder) folders.push(file);
                    else files.push(file);
                })
                // crud sorting, for now
                folders.sort((a, b) => { return b.mtime - a.mtime; })
                files.sort((a, b) => { return b.mtime - a.mtime; })

                return folders.concat(files);
            })
            .do(files => this.files[path] = files)
            .catch(this.handleError);
    }

    // UJS import job state

    listImports() {
        return this.http.get(this.ftpUrl + '/import-jobs', this.reqOptions)
            .map(result => {
                return result.json().result;
            })
            .catch(this.handleError);
    }


    createImportJob(jobIds: string[], wsId: number, narrativeId: number) {
        console.log('creating import job', jobIds)

        let data = {
            narrativeObjectId: 'ws.' + wsId + '.obj.' + narrativeId,
            jobIds: jobIds
        };

        let headers = new Headers({
            'Authorization': this.auth.getToken(),
            'Content-Type': 'application/json'
        });
        var reqOptions = new RequestOptions({ headers: headers });

        return this.http.post(this.ftpUrl + '/import-jobs', JSON.stringify(data), reqOptions)
            .map(result => {
                return result.json().result;
            })
            .catch(this.handleError);
    }

    deleteImport(jobId) {
        return this.http.delete(this.ftpUrl + '/import-job/' + jobId, this.reqOptions)
            .map(result => {
                console.log('deleted import job', result);
                return result.json().result;
            })
            .catch(this.handleError);
    }

    deleteImports(jobIds) {
        var reqs = jobIds.map((id) => { return this.deleteImport(id) });
        return Observable.forkJoin(reqs);
    }

    getImportInfo(jobId) {
        return this.http.get(this.ftpUrl + '/import-job/' + jobId, this.reqOptions)
            .map(result => {
                console.log('fetched import job info', result);
                return result.json().result;
            })
            .catch(this.handleError);

    }

    //deleteJob(jobId: string) {
    // uses special bulkio token
    //    return this.rpc.call('ujs', 'force_delete_job', [this.auth.getToken(), jobId], true)
    //}

    //deleteJobs(jobIds: string[]) {
    //    var reqs = [];
    //    jobIds.forEach(id => reqs.push( this.deleteJob(id) ) )
    //    return Observable.forkJoin(reqs)
    //}

    setPath(path: string) {
        this.selectedPath.next(path);
    }

    getPath() {
        return this.selectedPath;
    }

    addToCache(files, path) {
        let existing = this.files[path];
        // remove any existing from model
        files.forEach(f => {
            let i = existing.length
            while (i--) {
                if (existing[i].name === f.name)
                    existing.splice(i, 1)
            }
        })

        // throw at top for now (until angular table is complete)
        this.files[path] = files.concat(existing);
        return this.files[path];
    }



    selectFile(file) {
        this.selectedFiles.push(file);
        this.selectedFileCount.next(this.selectedFiles.length);
    }

    unselectFile(file) {
        this.selectedFiles = this.selectedFiles.filter(f => {
            if (f.path != file.path) return true;
        })

        this.selectedFileCount.next(this.selectedFiles.length);

        return this.selectedFiles;
    }

    selectType(type) {
        this.selectedType.next(type);
    }

    addSet() {
        if (!this.selectedFiles.length) return;

        this.selectedSets.push(this.selectedFiles);
        this.selectedSetCount.next(this.selectedSets.length);
        this.selectedFileCount.next(0);
    }


    clearSelected() {
        this.selectedFiles = [];
        this.selectedFileCount.next(0);
    }

    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }


}
