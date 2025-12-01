import socket
import threading
import json
import os
import ssl
import bcrypt
import hmac
import hashlib
import datetime

# --- CONFIGURATION ---
SERVER_HOST = '0.0.0.0'
SERVER_PORT = 8443  # Using 8443 for HTTPS

# Locate the certificate files relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CERT_FILE = os.path.join(BASE_DIR, 'server.cert')
KEY_FILE = os.path.join(BASE_DIR, 'server.key')

# --- 1. SETUP SSL CONTEXT ---
try:
    SSL_CONTEXT = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    SSL_CONTEXT.load_cert_chain(certfile=CERT_FILE, keyfile=KEY_FILE)
    print(f"✅ SSL Context loaded. Cert: {CERT_FILE}")
except FileNotFoundError:
    print(f"❌ FATAL ERROR: Could not find {CERT_FILE} or {KEY_FILE}")
    exit()


SERVERKEY = b'Umbreon4daw1n'

# --- HELPER FUNCTIONS ---

def read_file(file_path):
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def write_scores_file(file_path, scores):
    sorted_scores = sorted(scores, key=lambda x: x['score'], reverse=True)
    with open(file_path, 'w') as file:
        json.dump(sorted_scores, file, indent=4)

def save_score(scores, username, score, time):
    new_entry = {
        "username": username,
        "score": int(score),
        "time": time
    }
    scores.append(new_entry)

def create_signed_id(user_id):
    msg = str(user_id).encode('utf-8')
    signature = hmac.new(SERVERKEY, msg, hashlib.sha256).hexdigest()
    return f"{user_id}:{signature}"

def verify_signed_id(signed_token):
    try:
        user_id, received_sig = signed_token.split(':')

        msg = user_id.encode('utf-8')
        expected_sig = hmac.new(SERVERKEY, msg, hashlib.sha256).hexdigest()

        if hmac.compare_digest(received_sig, expected_sig):
            return user_id
        else:
            return None
            
    except ValueError:
        return None

def hash_password(plain_password):
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')
def check_password(plain_password, stored_hash):
    password_bytes = plain_password.encode('utf-8')
    stored_hash_bytes = stored_hash.encode('utf-8')
    return bcrypt.checkpw(password_bytes, stored_hash_bytes)

def createID(username):
    id = username+datetime.datetime.now().strftime('%f')
    return id

def update_users(username, password_input, objective):
    user_file_path = os.path.join(BASE_DIR, 'data', 'users.json')
    users = read_file(user_file_path)
    
    user_found = False
    credentialCheck = [False, False] 

    for entry in users:
        if entry['username'] == username:
            user_found = True
            stored_hash = entry.get('password_hash')
            if check_password(password_input, stored_hash):
                credentialCheck = [True, True]
            else:
                credentialCheck = [True, False]
            break
    if not user_found and objective == 'create':
        secure_hash = hash_password(password_input)
        new_entry = {
            "username": username,
            "password_hash": secure_hash,
            "unique_id": createID(username)
        }
        users.append(new_entry)
        with open(user_file_path, 'w') as file:
            json.dump(users, file, indent=4)
        credentialCheck = [False, False] 

    return credentialCheck

def get_cookie_value(request_data, cookie_name):
    # 1. Check if input is a string or a list
    if isinstance(request_data, str):
        lines = request_data.split('\r\n') # It's a string, so split it
    else:
        lines = request_data # It's already a list, use it as is

    # 2. Search for the cookie
    for line in lines:
        if line.startswith("Cookie:"):
            parts = line[7:].split(';')
            for part in parts:
                if '=' in part:
                    key, value = part.split('=')
                    if key.strip() == cookie_name:
                        return value.strip()
    return None

# --- CLIENT HANDLER (Thread) ---

def handle_client(secure_socket):
    try:
        # 1. Receive Request (Decrypted automatically)
        request_bytes = secure_socket.recv(4096)
        if not request_bytes:
            secure_socket.close()
            return
        
        request_data = request_bytes.decode('utf-8', errors='ignore')
        headers_list = request_data.split('\r\n')
        first_line = headers_list[0].split()
        
        if len(first_line) < 2:
            secure_socket.close()
            return

        method = first_line[0]
        path = first_line[1]
        
        print(f"Request: {method} {path}")

        base_dir = os.path.dirname(os.path.abspath(__file__))

        # --- A. HANDLE POST (Submit Score) ---
        if method == 'POST':
            content_length = 0
            for line in headers_list:
                print('Line: ' +line)
                if line.lower().startswith("content-length:"):
                    content_length = int(line.split(':')[1].strip())
                if line.lower().startswith('cookie'):
                    auth_token = (line.split('='))[1]
            
            body_start = request_data.find('\r\n\r\n') + 4
            body = request_data[body_start : body_start + content_length]
            if path == '/submitScore':
                try:
                    post_data = json.loads(body)
                    print(f'Received POST data: {post_data}')
                    
                    username = post_data.get('username')
                    score = post_data.get('score')
                    time_data = post_data.get('time')
                    
                    scores_file_path = os.path.join(base_dir, 'data', 'scores.json')
                    scores = read_file(scores_file_path)
                    save_score(scores, username, score, time_data)
                    write_scores_file(scores_file_path, scores)
                    
                    response_body = json.dumps({"status": "success", "message": "Score submitted!"}).encode()
                    header = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n" \
                            f"Content-Length: {len(response_body)}\r\n\r\n"
                    secure_socket.sendall(header.encode() + response_body)
                except Exception as e:
                    print(f"POST Error: {e}")
                    secure_socket.sendall(b"HTTP/1.1 500 Internal Server Error\r\n\r\n")
            elif path == '/submitCredentials':
                try:
                    post_data = json.loads(body)
                    print(f'Received POST data: {post_data}')
                    username = post_data.get('username')
                    password_input = post_data.get('password')
                    objective = post_data.get('objective')
                    return_value = update_users(username,password_input,objective)
                    if objective == 'login':
                        if return_value[0]:
                            if return_value[1]:
                                response_body = json.dumps({"status": "success", "message": "Credentials Valid!"}).encode()
                                header = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n" \
                                    f"Content-Length: {len(response_body)}\r\n\r\n"
                            else:
                                response_body = json.dumps({"status": "failure", "message": "Wrong password!"}).encode()
                                header = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n" \
                                    f"Content-Length: {len(response_body)}\r\n\r\n"
                        else:
                            response_body = json.dumps({"status": "failure", "message": "User not found!"}).encode()
                            header = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n" \
                                    f"Content-Length: {len(response_body)}\r\n\r\n"
                        
                    elif objective == 'create':
                        if return_value[0]:
                            response_body = json.dumps({"status": "failure", "message": "Username already exists!"}).encode()
                        else:
                            response_body = json.dumps({"status": "success", "message": "User created!"}).encode()
                        header = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n" \
                                f"Content-Length: {len(response_body)}\r\n\r\n"
                    secure_socket.sendall(header.encode() + response_body)
                except Exception as e:
                    print(f"POST Error: {e}")
                    secure_socket.sendall(b"HTTP/1.1 500 Internal Server Error\r\n\r\n")
            elif path == '/getLoginToken':
                try:
                    user_found=False
                    post_data = json.loads(body)
                    print(f'Received POST data: {post_data}')
                    username = post_data.get('username')
                    file = read_file(os.path.join(BASE_DIR, 'data', 'users.json'))
                    for entry in file:
                        if entry['username'] == username:
                            user_found = True
                            uniqueid = entry['unique_id']
                            
                            # Just create it and send it
                            safe_token = create_signed_id(uniqueid)
                            
                            response_body = json.dumps({"status": "success", "message": "Logged in!"}).encode('utf-8')
                            
                            header = "HTTP/1.1 200 OK\r\n" \
                                    "Content-Type: application/json\r\n" \
                                    f"Content-Length: {len(response_body)}\r\n" \
                                    f"Set-Cookie: auth_token={safe_token}; Path=/; HttpOnly; Secure\r\n" \
                                    "\r\n"
                                    
                            secure_socket.sendall(header.encode('utf-8') + response_body)
                            break
                    if not user_found:
                        print(f"User {username} not found")
                        error_body = json.dumps({"status": "error", "message": "User not found"}).encode('utf-8')
                        header = "HTTP/1.1 401 Unauthorized\r\n" \
                                "Content-Type: application/json\r\n" \
                                f"Content-Length: {len(error_body)}\r\n\r\n"
                        secure_socket.sendall(header.encode('utf-8') + error_body)
                except Exception as e:
                    print(f"POST Error: {e}")
                    secure_socket.sendall(b"HTTP/1.1 500 Internal Server Error\r\n\r\n")
            elif path == '/verifyLogin':
                try:
                    auth_token = get_cookie_value(headers_list, "auth_token")
                    if auth_token == None:
                        response_data = {"username": 'Gast', "status": "none"}
                        response_body = json.dumps(response_data).encode('utf-8')
                        
                        header = "HTTP/1.1 200 OK\r\n" \
                                "Content-Type: application/json\r\n" \
                                f"Content-Length: {len(response_body)}\r\n" \
                                "Access-Control-Allow-Origin: *\r\n" \
                                "\r\n"
                        secure_socket.sendall(header.encode('utf-8') + response_body)
                    user_id = verify_signed_id(auth_token) if auth_token else None

                    if user_id:
                        user_file_path = os.path.join(BASE_DIR, 'data', 'users.json')
                        users = read_file(user_file_path)
                        
                        found_username = None

                        for entry in users:
                            if str(entry['unique_id']) == str(user_id):
                                found_username = entry['username']
                                break

                        if found_username:
                            response_data = {"username": found_username, "status": "active"}
                            response_body = json.dumps(response_data).encode('utf-8')
                            
                            header = "HTTP/1.1 200 OK\r\n" \
                                    "Content-Type: application/json\r\n" \
                                    f"Content-Length: {len(response_body)}\r\n" \
                                    "Access-Control-Allow-Origin: *\r\n" \
                                    "\r\n"
                            secure_socket.sendall(header.encode('utf-8') + response_body)
                        else:
                            raise Exception("User ID not found in database")

                    else:
                        print("Verify failed: No valid token")
                        error_body = json.dumps({"error": "Not logged in"}).encode('utf-8')
                        header = "HTTP/1.1 401 Unauthorized\r\n" \
                                "Content-Type: application/json\r\n" \
                                f"Content-Length: {len(error_body)}\r\n" \
                                "Access-Control-Allow-Origin: *\r\n" \
                                "\r\n"
                        secure_socket.sendall(header.encode('utf-8') + error_body)

                except Exception as e:
                    print(f"Login Verify Error: {e}")
                    # Send a generic 500 error if something crashes
                    secure_socket.sendall(b"HTTP/1.1 500 Server Error\r\n\r\n")

            elif path == '/Logout':
                try:
                    print('Starting Logout')
                    auth_token = get_cookie_value(headers_list, "auth_token")
                    print(auth_token)
                    if auth_token == None:
                        response_data = {'message': 'User not logged in!'}
                        response_body = json.dumps(response_data).encode('utf-8')
                        header = "HTTP/1.1 200 OK\r\n" \
                                "Content-Type: application/json\r\n" \
                                f"Content-Length: {len(response_body)}\r\n" \
                                "Access-Control-Allow-Origin: *\r\n" \
                                "\r\n"
                        secure_socket.sendall(header.encode('utf-8') + response_body)
                    else:
                        response_data = {'message': 'Logged out!'}
                        response_body = json.dumps(response_data).encode('utf-8')
                        header = "HTTP/1.1 200 OK\r\n" \
                                    "Content-Type: application/json\r\n" \
                                    f"Content-Length: {len(response_body)}\r\n" \
                                    f"Set-Cookie: auth_token=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure\r\n" \
                                    "\r\n"
                        secure_socket.sendall(header.encode('utf-8') + response_body)
                except Exception as e:
                    print(f"Login Verify Error: {e}")
                    secure_socket.sendall(b"HTTP/1.1 500 Server Error\r\n\r\n")

            secure_socket.close()
            return

        # --- B. HANDLE GET (Your Custom Path Handling) ---
        elif method == 'GET':
            file_path = None
            content_type = 'text/plain'
            content_name = path.split('/')
            content_file = content_name[len(content_name)-1]
            print(content_file)
            
            # --- YOUR SPECIFIC MAPPING RESTORED HERE ---
            #html
            if path == '/' or path == '/sylas_collection':
                file_path = os.path.join(base_dir, 'html','index.html')
                content_type = 'text/html'
            elif path == '/bullethell':
                file_path = os.path.join(base_dir, 'html','gamepage.html')
                content_type = 'text/html'
            elif path == '/Account':
                file_path = os.path.join(base_dir, 'html','AccountPage.html')
                content_type = 'text/html'
            elif path == '/Leaderboard':
                file_path = os.path.join(base_dir, 'html','scorepage.html')
                content_type = 'text/html'
            #css
            elif path == '/styles.css':
                file_path = os.path.join(base_dir, 'css', 'styles.css')
                content_type = 'text/css'
            #js
            elif path == '/js/'+content_file:
                file_path = os.path.join(base_dir, 'js', content_file)
                content_type = 'application/javascript'
            #json
            elif path == '/data/'+content_file:
                file_path = os.path.join(base_dir, 'data', content_file+'.json')
                content_type = 'application/json'
            #other
            elif path == '/favicon.ico':
                file_path = os.path.join(base_dir, 'favicon.ico')
                content_type = 'image/x-icon'
            
            # Fonts
            elif path == '/fonts/'+content_file:
                file_path = os.path.join(base_dir, 'fonts', content_file)
                content_type = 'font/ttf'
            
            # Audio Files
            elif path == '/audio/'+content_file:
                file_path = os.path.join(base_dir, 'audio', content_file)
                content_type = 'audio/wav'

            if file_path and os.path.exists(file_path):
                try:
                    is_binary = 'image' in content_type or 'audio' in content_type or 'font' in content_type
                    mode = 'rb' if is_binary else 'r'
                    
                    with open(file_path, mode) as f:
                        content = f.read()
                        if mode == 'r':
                            content = content.encode('utf-8')
                    
                    header = f"HTTP/1.1 200 OK\r\nContent-Type: {content_type}\r\n" \
                             f"Content-Length: {len(content)}\r\n\r\n"
                    
                    secure_socket.sendall(header.encode() + content)
                except Exception as e:
                    print(f"File Error: {e}")
                    secure_socket.sendall(b"HTTP/1.1 500 Internal Server Error\r\n\r\n")
            else:
                print(f"404 Not Found: {path}")
                secure_socket.sendall(b"HTTP/1.1 404 Not Found\r\n\r\n404 Not Found")

        secure_socket.close()

    except Exception as e:
        print(f"Handler Error: {e}")
        if 'secure_socket' in locals():
            secure_socket.close()

# --- MAIN SERVER LOOP ---

def start_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((SERVER_HOST, SERVER_PORT))
    server_socket.listen(5)

    print(f'🔒 Secure Server listening on https://localhost:{SERVER_PORT} ...')
    print(f'📂 Serving files from: {BASE_DIR}')

    while True:
        try:
            raw_socket, client_address = server_socket.accept()
            
            # Wrap the socket for SSL
            try:
                secure_socket = SSL_CONTEXT.wrap_socket(raw_socket, server_side=True)
            except ssl.SSLError as e:
                print(f"SSL Handshake failed: {e}")
                raw_socket.close()
                continue

            print(f"✨ Accepted SECURE connection from: {client_address}")
            
            client_handler = threading.Thread(target=handle_client, args=(secure_socket,))
            client_handler.start()
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Server Loop Error: {e}")

if __name__ == "__main__":
    start_server()