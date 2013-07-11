knockout-oftype
===============

Some Extensions and Helpers for handling the Constructor pattern in Knockout


###Example

Provided you had a model represented as:


    var spec = {
        id: 123,
        name: "Breaded Parmesan Ranch Chicken",
        type: "Salad",
        ingredients: [
            { id: 243, name: "Crushed Corn Flakes", amount: "3/4 cup" },
            { id: 512, name: "Grated Parmesan Cheese", amount: "3/4 cup" },
            { id: 928, name: "Chicken Breasts", amount: "8 x 4oz pcs" },
            { id: 148, name: "Butter (melted)", amount: "1/2 cup" }
        ]
    };
    
    
  With the two corresponding Constructors:
  
  
    var Recipe = function(spec){
        
        this.id = ko.observable();
        this.name = ko.observable();
        this.type = ko.observable();
        
        this.ingredients = ko.observableArray();
    };
    
    var Ingredient = function(spec){
        this.id = ko.observable();
        this.name = ko.observable();
        this.amount = ko.observable();
    };
    
    
Which can quickly devolve into a mess such as:


    var Recipe = function(spec){
        
        this.id = ko.observable();
        this.name = ko.observable();
        this.type = ko.observable();
        
        var mappedIngredients = ko.utils.arrayMap(spec.ingredients, function(el) {
            return new Ingredient(el);
        });
        this.ingredients = ko.observableArray(mappedIngredients );

        // add new ingredient to ingredients array
        this.addIngredient = function(data){
            // nu' up data to be an Ingredient type...
            var ingredient = new Ingredient(data);
            // now add it to the array
            this.ingredients.push(ingredient);
        };

        // add new ingredient to ingredients array
        this.loadIngredients = function(){
            $.getJSON('/recipe/' + this.id() + '/ingredients',function(data){
    
                // NOOOO, not this again!!
                var mappedIngredients = ko.utils.arrayMap(data, function(el) {
                    return new Ingredient(el);
                });
                this.ingredients(mappedIngredients);
            });
        };

    };
    
Which just end's up getting worse and worse, the more places in your code you are manipulating the `ingredients` object.

With the `.ofType` extension, you can simply replace all that with:
    
    var Recipe = function(spec){
        
        this.id = ko.observable();
        this.name = ko.observable();
        this.type = ko.observable();
        
        this.ingredients = ko.observableArray().ofType(Ingredient);

        this.addIngredient = function(data){
            this.ingredients.push(data);
        };

        this.loadIngredients = function(){
            $.getJSON('/recipe/' + this.id() + '/ingredients',function(data){
                this.ingredients(data);
            });
        };

    };
    

Which helps keep your code to the point.

You can read more about it's implementation in [this tech.pro tutorial](http://tech.pro/tutorial/1417/working-with-typed-arrays-in-knockoutjs).
    
    
    
    
    
    
    
    
