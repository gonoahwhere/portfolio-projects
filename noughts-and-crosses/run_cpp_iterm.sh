#!/bin/bash
CPP_FILE="$1"
EXECUTABLE="${CPP_FILE%.*}"

# Get directory of the main file
DIR="$(dirname "$CPP_FILE")"

# Compile the C++ file
cd "$DIR" || { echo "Failed to enter directory $DIR"; exit 1; }
clang++ -std=c++17 -stdlib=libc++ *.cpp -o "$EXECUTABLE"
if [ $? -ne 0 ]; then
    echo "Compilation failed."
    exit 1
fi

# Create a unique temporary file
TMP_FILE="$(mktemp /tmp/run_cpp_XXXX)"
TMP_CMD="${TMP_FILE}.command"
mv "$TMP_FILE" "$TMP_CMD"

# Write the script content
cat <<EOF > "$TMP_CMD"
#!/bin/bash
cd "$(dirname "$CPP_FILE")"
"./$(basename "$EXECUTABLE")"
echo
echo "  Press Enter to close the Terminal."
read
# Delete this temporary script
rm -- "\$0"
EOF

chmod +x "$TMP_CMD"

# Open the script in iTerm-2
open -b "com.googlecode.iterm2" "$TMP_CMD"
