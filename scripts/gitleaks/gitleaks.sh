# Run detect-secrets
lint_find_secrets() {
	echo "- Running secrets check"
	SECRETS_SUPPORTED_VERSION="8.8.11"
	INSTALLED_SECRETS_VERSION="$(gitleaks version)"
	if [[ $INSTALLED_SECRETS_VERSION != *"$SECRETS_SUPPORTED_VERSION"* ]]; then
		echo "Installing gitleaks $(uname -s)_$(arch) for the first time..."
		FILE=`curl -s https://api.github.com/repos/zricethezav/gitleaks/releases/tags/v${SECRETS_SUPPORTED_VERSION} | jq -r "first(.assets[].name | select(test(\"$(uname -s)_$(arch)\"; \"i\") or test(\"$(uname -s)_x64\"; \"i\")))"`
		TMPDIR=$(mktemp -d)
 		curl -o ${TMPDIR}/${FILE} -JL https://github.com/zricethezav/gitleaks/releases/download/v${SECRETS_SUPPORTED_VERSION}/${FILE}
		tar zxv -C "$(go env GOPATH)"/bin -f ${TMPDIR}/${FILE} gitleaks
		rm ${TMPDIR}/${FILE}
		echo "Done installing gitleaks"
	fi
	echo "  - Finding leaks in git log"
	gitleaks detect -v --redact  -c scripts/gitleaks/.gitleaks.toml
	if [ $? -ne 0 ]; then
		exit 1
	fi
	echo "  - Finding leaks in local repo"
	gitleaks detect --no-git -v --redact -c scripts/gitleaks/.gitleaks.toml
	if [ $? -ne 0 ]; then
		exit 1
	fi
	echo "- Secrets check passed sucessfully!"
}

lint_find_secrets
