define([],
    function( ){

        function MyClass(age)
        {
            this.init();

            return( this );
        }

        var p = MyClass.prototype;

        p.init = function()
        {
            console.log("MyClass initialised");
        }

        // Return the base class constructor.
        return( MyClass );
    }
);