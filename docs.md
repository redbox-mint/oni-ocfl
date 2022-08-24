## Functions

<dl>
<dt><a href="#createRepo">createRepo(ocflRoot, ocflScratch)</a></dt>
<dd><p>Create to repo if not exists, forcing creating of scratch dir</p></dd>
<dt><a href="#connectRepo">connectRepo(ocflRoot, ocflScratch)</a></dt>
<dd><p>Connect to repo if exists, forcing creating of scratch dir if not exists</p></dd>
<dt><a href="#checkin">checkin(repository, rocrateDir, crate)</a></dt>
<dd><p>Checkin directory, creates an object in the repository</p></dd>
<dt><a href="#getFileInfo">getFileInfo(repository, crateId, version, filePath)</a></dt>
<dd><p>Get File Info</p></dd>
<dt><a href="#arcpId">arcpId(crate, identifier, setIdentifier)</a></dt>
<dd><p>Get File Info</p></dd>
<dt><a href="#createRepo">createRepo(ocflRoot, ocflScratch)</a></dt>
<dd><p>Create to repo if not exists, forcing creating of scratch dir</p></dd>
<dt><a href="#connectRepo">connectRepo(ocflRoot, ocflScratch)</a></dt>
<dd><p>Connect to repo if exists, forcing creating of scratch dir if not exists</p></dd>
<dt><a href="#checkin">checkin(repository, rocrateDir, crate)</a></dt>
<dd><p>Checkin directory, creates an object in the repository</p></dd>
<dt><a href="#getFileInfo">getFileInfo(repository, crateId, version, filePath)</a></dt>
<dd><p>Get File Info</p></dd>
<dt><a href="#arcpId">arcpId(crate, identifier, setIdentifier)</a></dt>
<dd><p>Get File Info</p></dd>
</dl>

<a name="createRepo"></a>

## createRepo(ocflRoot, ocflScratch)
<p>Create to repo if not exists, forcing creating of scratch dir</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ocflRoot | <code>string</code> | <p>ocflRoot dir.</p> |
| ocflScratch | <code>string</code> | <p>ocflScratch dir.</p> |

<a name="connectRepo"></a>

## connectRepo(ocflRoot, ocflScratch)
<p>Connect to repo if exists, forcing creating of scratch dir if not exists</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ocflRoot | <code>string</code> | <p>ocflRoot dir.</p> |
| ocflScratch | <code>string</code> | <p>ocflScratch dir.</p> |

<a name="checkin"></a>

## checkin(repository, rocrateDir, crate)
<p>Checkin directory, creates an object in the repository</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| repository | <code>Repository</code> | <p>Repo with objects.</p> |
| rocrateDir | <code>string</code> | <p>Object dir.</p> |
| crate | <code>ROCrate</code> | <p>ROCrate to get id.</p> |

<a name="getFileInfo"></a>

## getFileInfo(repository, crateId, version, filePath)
<p>Get File Info</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| repository | <code>Repository</code> | <p>Repo with objects.</p> |
| crateId | <code>string</code> | <p>Object Id.</p> |
| version | <code>string</code> | <p>Optional Version.</p> |
| filePath | <code>string</code> | <p>File path to get from the state.</p> |

<a name="arcpId"></a>

## arcpId(crate, identifier, setIdentifier)
<p>Get File Info</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| crate | <code>ROCrate</code> | <p>crate.</p> |
| identifier | <code>string</code> | <p>identifier Id.</p> |
| setIdentifier | <code>boolean</code> | <p>force setting identifier, if not fallback with domain identifier.</p> |

<a name="createRepo"></a>

## createRepo(ocflRoot, ocflScratch)
<p>Create to repo if not exists, forcing creating of scratch dir</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ocflRoot | <code>string</code> | <p>ocflRoot dir.</p> |
| ocflScratch | <code>string</code> | <p>ocflScratch dir.</p> |

<a name="connectRepo"></a>

## connectRepo(ocflRoot, ocflScratch)
<p>Connect to repo if exists, forcing creating of scratch dir if not exists</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ocflRoot | <code>string</code> | <p>ocflRoot dir.</p> |
| ocflScratch | <code>string</code> | <p>ocflScratch dir.</p> |

<a name="checkin"></a>

## checkin(repository, rocrateDir, crate)
<p>Checkin directory, creates an object in the repository</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| repository | <code>Repository</code> | <p>Repo with objects.</p> |
| rocrateDir | <code>string</code> | <p>Object dir.</p> |
| crate | <code>ROCrate</code> | <p>ROCrate to get id.</p> |

<a name="getFileInfo"></a>

## getFileInfo(repository, crateId, version, filePath)
<p>Get File Info</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| repository | <code>Repository</code> | <p>Repo with objects.</p> |
| crateId | <code>string</code> | <p>Object Id.</p> |
| version | <code>string</code> | <p>Optional Version.</p> |
| filePath | <code>string</code> | <p>File path to get from the state.</p> |

<a name="arcpId"></a>

## arcpId(crate, identifier, setIdentifier)
<p>Get File Info</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| crate | <code>ROCrate</code> | <p>crate.</p> |
| identifier | <code>string</code> | <p>identifier Id.</p> |
| setIdentifier | <code>boolean</code> | <p>force setting identifier, if not fallback with domain identifier.</p> |

