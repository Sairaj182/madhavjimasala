## 1. AWS SSO:-

```bash
aws configure sso --profile new-profile-name
```

then follow the prompts and do browser authentication

- start sso login: 
```bash
aws sso login --profile new-profile-name
```

- verify the account: 
```bash
aws sts get-caller-identity --profile new-profile-name
```

- set profile for current session: 
```bash
$env:AWS_PROFILE = "new-profile-name"
```
