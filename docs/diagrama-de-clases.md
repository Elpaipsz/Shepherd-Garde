classDiagram
    direction TB

    class User {
        +UUID id
        +String email
        +String password_hash
        +Boolean is_active
        +Boolean is_staff
        +DateTime date_joined
        +login(email, password) Token
        +logout()
        +reset_password()
    }

    class Address {
        +UUID id
        +String alias
        +String address_line_1
        +String city
        +String state
        +String country
        +String zip_code
        +Boolean is_default_shipping
        +is_valid() Boolean
    }

    class Collection {
        +UUID id
        +String name
        +String slug
        +String description
        +DateTime release_date
        +DateTime end_date
        +is_droppable() Boolean
        +is_active() Boolean
        +is_preview() Boolean
    }

    class Product {
        +UUID id
        +String name
        +String slug
        +String description
        +Decimal base_price
        +Boolean is_active
        +DateTime created_at
        +get_available_stock() Integer
    }

    class Review {
        +UUID id
        +Integer rating
        +String comment
        +DateTime created_at
    }

    class ProductVariant {
        +UUID id
        +String sku
        +String size
        +String color
        +Integer stock
        +Decimal price_override
        +reserve_stock(quantity) Boolean
        +release_stock(quantity)
        +decrement_stock_pessimistic(quantity) Boolean
    }

    class Cart {
        +UUID id
        +String session_id
        +DateTime updated_at
        +add_item(variant, quantity)
        +remove_item(variant)
        +clear()
        +calculate_total() Decimal
        +validate_items_availability() Boolean
    }

    class CartItem {
        +UUID id
        +Integer quantity
        +DateTime added_at
        +get_subtotal() Decimal
    }

    class Order {
        +UUID id
        +String order_number
        +String status_choices
        +Decimal total_amount
        +DateTime created_at
        +process_payment(payment_details) Boolean
        +transition_status(new_status)
        +cancel_order()
    }

    class OrderItem {
        +UUID id
        +Integer quantity
        +Decimal price_at_purchase
        +get_subtotal() Decimal
    }

    class Invoice {
        +UUID id
        +String invoice_number
        +String pdf_url
        +DateTime issued_at
        +generate_pdf() String
    }

    %% Relaciones Usuario y Perfil
    User "1" --> "many" Address : manages
    
    %% Relaciones Catálogo
    Collection "many" -- "many" Product : categorizes
    Product "1" *-- "many" ProductVariant : owns
    Product "1" *-- "many" Review : has
    User "1" --> "many" Review : writes
    
    %% Relaciones Carrito (soporta sesión anónima o User)
    User "0..1" --> "0..1" Cart : owns
    Cart "1" *-- "many" CartItem : contains
    CartItem "many" --> "1" ProductVariant : reserves
    
    %% Relaciones Órdenes y Checkout
    User "1" --> "many" Order : places
    Order "1" --> "1" Address : ships_to
    Order "1" *-- "many" OrderItem : contains
    OrderItem "many" --> "1" ProductVariant : snapshot_of
    
    %% Relaciones Facturación
    Order "1" -- "0..1" Invoice : generates
