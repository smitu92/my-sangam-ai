import sys
import os
# Add the 'DataClearning' root folder to the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from API.v2.handle_user_messag import handle_user_message

print(handle_user_message("i want to do m tech , and i want to do it from hyderabad , that means i only want schemes which works on hyderabad ", {"state":"Gujarat","category":"General","occupation":"Student","income":"Low"}, []))