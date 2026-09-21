# Publication privacy review

## Scope

The public `omarchy-boot` repository contains only the README and ten Markdown reports. Its Git history starts from sanitized documentation; it does not reuse the original reconstruction bundle's repository or history.

Excluded from publication:

- API keys, access tokens, passwords, private keys, cookies, authentication databases, and populated environment files.
- Raw conversations, prompts, shell/system/application logs, private evidence databases, and their archive contents.
- Application binaries, models, source trees, dependencies, configuration payloads, installer scripts, machine-readable profiles, and compressed rebuild bundles.
- Personal home-directory names, exact conversation/session locators, unrelated private project details, and unnecessary account/network identifiers.

## Review method

The documentation was checked with Gitleaks v8.30.1 and editorial privacy review. The scanner was obtained from the official Gitleaks release and checked against that release's SHA-256 checksums. The first scan of the original eleven documents found no credential signatures, but editorial review identified personal paths and private provenance that needed removal before publication.

The sanitized files and initial Git history are scanned again before upload. Only the explicitly reviewed Markdown files are staged. Local documentation links are checked, and the published file list and content hashes are compared with the reviewed local files after upload.

Technical software preferences, hardware/architecture distinctions, generic configuration paths, and reconstruction limitations remain intentionally public because they are the subject of the instructions. Opaque review labels may remain as historical evidence markers; the underlying private evidence is not provided.

## Boundaries

A clean secret scan is not a mathematical guarantee that arbitrary prose contains no sensitive information. It detects known credential patterns; editorial review addresses personal context that pattern matching misses. This review is specific to these documentation files, not authorization to publish the full local bundle, future files, or private evidence.

Historical verification counts in other reports concern the earlier local reconstruction bundle. That bundle had its own privacy review, including binary/source-fixture exceptions; those assets and exception files are not part of this public repository. Nothing here supplies working account access or proves a fresh-machine installation.

New-machine accounts, network enrollment, notification topics, device pairing, and SSH trust must be provisioned separately. Do not put real values into public examples or commits. Review future changes before pushing, and revoke any real credential immediately if it is ever disclosed; deleting a public commit does not undo exposure.
