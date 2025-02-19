import hashlib


def md5(password):
    # Create an MD5 hash object
    md5_hasher = hashlib.md5()

    # Update the hash object with the bytes representation of the password
    md5_hasher.update(password.encode('utf-8'))

    # Get the hexadecimal representation of the hash
    hashed_password = md5_hasher.hexdigest()

    return hashed_password
