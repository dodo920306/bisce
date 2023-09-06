import subprocess


cmd = "/home/ubuntu/website/backend/base/api/token_erc_20 " + "|| echo 'gg'"
res = subprocess.run(cmd.split(" "), capture_output=True)
print(res.stdout.decode())
print(res.stderr.decode())
