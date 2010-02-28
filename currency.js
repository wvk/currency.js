/*
  CurrencyAmount: represents a number of Euros and Cents (or Dollars and Cents,
                 Pounds and Pence or whichever flavour of currency you fancy).

  Copyright (c) 2010 by Willem van Kerkhof, <wvk@consolving.de>

  Released under the terms of the GNU General Public License v. 2.0

  * Internally, the value is represented as cents. Thus, in order to do any real
    calculations, you have to do so by using the 'cents' attribute.
    Example:

    var x = $M(4200);
    var y = $M(2300);
    var sum = $M(x.cents + y.cents);
    alert(sum.to_s()) // => 65,00 €
 */
var CurrencyAmount = Class.create({
  /*  use this to set the currency symbol for formatted output.
      Should be the HTML entity for any currency symbol except "$", e.g. &euro;, &pound; or &yen;
   */
  currency_symbol: '&euro;',

  /*  use this to set the decimal separator for formatted output.
      might be a comma (,) or a dot (.) or anything else you fancy.
   */
  decimal_separator: ',',

  /*  accepts either an integer number that will be interpreted as a number of cents
      or another CurrencyAmount
   */
  initialize: function(cents) {
    if (typeof(cents) == 'string' || cents == null || cents == undefined)
      throw 'argument is '+ Object.inspect(cents) + ' in $pM';
    if (Object.isNumber(cents))
      this.cents = cents;
    else
      this.cents = cents.cents;
  },

  /*  to_s: formatted output of the monetary value represented by this.
      Example: $M(4223).to_s() yields "42,23&thinsp;&euro;", being displayed as "42,23 €"
   */
  to_s: function() {
    return this.to_val() + '&thinsp;' + this.currency_symbol;
  },

  /*  to_val: the same as to_s but without the appended currency symbol.
   */
  to_val: function() {
    var euros = Math.floor(Math.abs(this.cents / 100));
    var val   = Math.round(Math.abs(this.cents % 100));
    if (val == 100) {
      euros = euros + 1;
      var cents = '00';
    } else if (val < 10) {
      var cents = '0' + val;
    } else {
      var cents = val;
    }
    if (Object.inspect(cents) != 'NaN' && Object.inspect(cents) != 'NaN')
      return (this.cents < 0 ? '-' : '') + euros + this.decimal_separator + cents;
    else
      return null;
  }
});

/*
  $M: convenience wrapper function for new CurrencyAmount;
*/
function $M(val) {
  return new CurrencyAmount(val);
}
/*
  $pM: parses a string containing a monetary value and returns a CurrencyAmount object.

  * The separator may either be a decimal point (.) or a decimal comma (,).
  * Underscores (_), Quotes (') and the like are not allowed.
  * Only the first two digits after the comma are considered.
  * Currency symbols and the like are ignored
  * a zero before the comma is optional
  * no comma will result in the whole string being passed directly to Javascript's parseInt function
 */
function $pM(val) {
  if (typeof(val) != 'string') throw 'expected argument to be a String in $pM, but was ' + typeof(val);

  var parts = val.match(/(\-?)\s*(\d*)[,\.](\d{0,2})/);
  if (parts) {
    var euros = parts[2];
    if (parseInt(euros) == 0 )
      euros = '';
    if (parts[3].length == 2)
      var cents = parts[3];
    else if (parts[3].length == 1)
      var cents = parts[3] + '0';
    else if (parts[3].length == 0)
      var cents = '00';
    return new CurrencyAmount(parseInt(parts[1] + euros + cents));
  } else if (val.match(/^\-?\s*\d+$/)) {
    return new CurrencyAmount(parseInt(val) * 100);
  } else {
    return null;
  }
}

/*
  monetize: reformat the value of an input field containing a 'raw' value to a currency amount

  * an empty or invalid field will be formatted as if it contained a zero value
*/
function monetize(element) {
  element.value = ($pM(element.value) || $M(0)).to_val();
}
