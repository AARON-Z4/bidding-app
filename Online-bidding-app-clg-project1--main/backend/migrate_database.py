"""
Database Migration Script for Google OAuth
Adds new fields to the users table for OAuth support
"""
import sqlite3
import os

# Database path
DB_PATH = "nextgen_marketplace.db"

def migrate_database():
    """Add OAuth fields to users table"""
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at {DB_PATH}")
        print("The database will be created automatically when you start the server.")
        return
    
    print("🔄 Starting database migration...")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        migrations_needed = []
        
        # Check which columns need to be added
        if 'google_id' not in columns:
            migrations_needed.append(('google_id', 'TEXT'))
        if 'profile_picture' not in columns:
            migrations_needed.append(('profile_picture', 'TEXT'))
        if 'auth_provider' not in columns:
            migrations_needed.append(('auth_provider', 'TEXT DEFAULT "local"'))
        
        if not migrations_needed:
            print("✅ Database is already up to date!")
            conn.close()
            return
        
        # Add new columns
        for column_name, column_type in migrations_needed:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}")
                print(f"✅ Added column: {column_name}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e).lower():
                    print(f"⚠️  Column {column_name} already exists, skipping...")
                else:
                    raise
        
        # Make password nullable by creating a new table and copying data
        print("🔄 Making password field nullable...")
        
        # Get current table schema
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
        old_schema = cursor.fetchone()[0]
        
        # Check if password is already nullable
        if "password TEXT NOT NULL" in old_schema or "password VARCHAR NOT NULL" in old_schema:
            # Create new table with nullable password
            cursor.execute("""
                CREATE TABLE users_new (
                    id INTEGER PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT,
                    name TEXT NOT NULL,
                    phone TEXT,
                    role TEXT NOT NULL,
                    is_active INTEGER DEFAULT 1,
                    google_id TEXT UNIQUE,
                    profile_picture TEXT,
                    auth_provider TEXT DEFAULT 'local',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP
                )
            """)
            
            # Copy data from old table to new table
            cursor.execute("""
                INSERT INTO users_new 
                SELECT id, email, password, name, phone, role, is_active, 
                       google_id, profile_picture, auth_provider, created_at, updated_at
                FROM users
            """)
            
            # Drop old table and rename new table
            cursor.execute("DROP TABLE users")
            cursor.execute("ALTER TABLE users_new RENAME TO users")
            
            print("✅ Password field is now nullable")
        else:
            print("✅ Password field is already nullable")
        
        # Create indexes for better performance
        try:
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)")
            print("✅ Created index on google_id")
        except sqlite3.OperationalError:
            print("⚠️  Index on google_id already exists")
        
        conn.commit()
        conn.close()
        
        print("\n✅ Database migration completed successfully!")
        print("\n📋 New fields added:")
        print("   - google_id: Stores Google user ID")
        print("   - profile_picture: Stores Google profile picture URL")
        print("   - auth_provider: Tracks authentication method (local/google)")
        print("   - password: Now nullable for OAuth users")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        print("\n💡 Tip: If you're in development, you can delete the database and let it recreate:")
        print(f"   Remove-Item \"{DB_PATH}\"")
        raise

if __name__ == "__main__":
    migrate_database()