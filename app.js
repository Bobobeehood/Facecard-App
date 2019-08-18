    const supportedCards = {
        visa, mastercard
      };

      const countries = [
        {
          code: "US",
          currency: "USD",
          currencyName: '',
          country: 'United States'
        },
        {
          code: "NG",
          currency: "NGN",
          currencyName: '',
          country: 'Nigeria'
        },
        {
          code: 'KE',
          currency: 'KES',
          currencyName: '',
          country: 'Kenya'
        },
        {
          code: 'UG',
          currency: 'UGX',
          currencyName: '',
          country: 'Uganda'
        },
        {
          code: 'RW',
          currency: 'RWF',
          currencyName: '',
          country: 'Rwanda'
        },
        {
          code: 'TZ',
          currency: 'TZS',
          currencyName: '',
          country: 'Tanzania'
        },
        {
          code: 'ZA',
          currency: 'ZAR',
          currencyName: '',
          country: 'South Africa'
        },
        {
          code: 'CM',
          currency: 'XAF',
          currencyName: '',
          country: 'Cameroon'
        },
        {
          code: 'GH',
          currency: 'GHS',
          currencyName: '',
          country: 'Ghana'
        }
      ];

      const billHype = () => {
        const billDisplay = document.querySelector('.mdc-typography--headline4');
        if (!billDisplay) return;

        billDisplay.addEventListener('click', () => {
          const billSpan = document.querySelector("[data-bill]");
          if (billSpan &&
            appState.bill &&
            appState.billFormatted &&
            appState.billFormatted === billSpan.textContent) {
            window.speechSynthesis.speak(
              new SpeechSynthesisUtterance(appState.billFormatted)
            );
          }
        });
      };

	  const appState = {};

	  const formatAsMoney = (amount, buyerCountry)=> {
		  let getCountry = countries.find(country=>{
			  return country.country===buyerCountry;
		  });
		  if(!getCountry){
			  return amount.toLocaleString(countries[0].code,{
				  style:'currency',currency:countries[0].currency
			  });
		  }else{
		return amount.toLocaleString(`en-${getCountry.code}`, {style: 'currency', currency: getCountry.currency});
		}
	  };

	  const flagIfInvalid = (field, isValid) => {
		  if(isValid){
			  field.classList.remove('is-invalid')
		  }
		  else{
			  field.classList.add('is-invalid')
			  }
	  };

	  const expiryDateFormatIsValid = (field) => {
		  const dataRegEx = /^([1-9]|0[1-9]|1[012])\/\d{2}$/;
		  return dataRegEx.test(field.value)?true:false;


	  };

	  const detectCardType = (first4Digits) => {
		  const firstField = document.querySelector('[data-credit-card]');
		  const fieldType = document.querySelector('[data-card-type]');
		  if(first4Digits[0] === 4){
			  firstField.classList.add('is-visa');
			  firstField.classList.remove('is-mastercard');
			  fieldType.src = supportedCards.visa;
			  return 'is-visa';
		  } else if(first4Digits[0] === 5){
			  firstField.classList.add("is-mastercard");
			  firstField.classList.remove('is-visa');
			  fieldType.src = supportedCards.mastercard;
			  return 'is-mastercard';
		  }
	  };

	  const validateCardExpiryDate = () => {
		  const assignedField = document.querySelector('[data-cc-info] input:nth-child(2)');
		  const value = expiryDateFormatIsValid(assignedField);
		  const cardExpiryMonth = assignedField.value.split('/')[0];
		  const cardExpiryYear = `20${assignedField.value.split('/')[1]}`;
		  const dateInput = new Date (`${cardExpiryMonth}-01-${cardExpiryYear}`);
		  const result = value && dateInput >= new Date()? true:false;
		  flagIfInvalid(assignedField, result);
		  return result;
	  };

	  const validateCardHolderName = () => {
		  let field = document.querySelectorAll('[data-cc-info]>input')[0];
		  const {value} = field;
		  const nameRegEx = /^[A-Za-z]{3,}\s[A-Za-z]{3,}$/;
		  const isNameInputValid = nameRegEx.test(value);
		  flagIfInvalid(field, isNameInputValid);
		  return isNameInputValid;
	  };

	  const validateWithLuhn = (digits) => {
		  let totalSum = 0;
		  let evenSum = 0;
		  let oddSum = 0;

		  for(let i = 0; i < digits.length; i++){
			  if(i % 2 === 0){
				  if(digits[i] * 2 > 9){
					  evenSum += digits[i] * 2 -9;
				  }
				  else{
					  evenSum += digits[i] * 2;
				  }
			  }else{
				  oddSum += digits[i];
			  }
		  }

		  totalSum =evenSum + oddSum;
		  return totalSum % 10 === 0;
	  };

	  const validateCardNumber = () => {
		  let cardDigitNumber = '';
		  const cardFields = document.querySelectorAll('[data-cc-digits] input');
		  cardFields.forEach(field =>{
			  cardDigitNumber += field.value;
		  });
		  const cardNumber = cardDigitNumber.toString().split('').map(xValue => parseInt(xValue));
		  const label = document.querySelector('[data-cc-digits]');
		  const isValidWithLuhn = validateWithLuhn(cardNumber);

		  if(isValidWithLuhn){
			  label.classList.remove('is-invalid');
			  return true;
		  }else {
			  label.classList.add('is-invalid');
			  return false;
		  }
	  };

	  const validatePayment = () => {
		  validateCardNumber();
		  validateCardHolderName();
		  validateCardExpiryDate();
	  };

	  const smartCursor = (event, fieldIndex, fields) =>{
		  if(event.target.value.length === event.target.size){
		 		fields[fieldIndex + 1].focus();
		 } 
	  };

	  const enableSmartTyping = () => {
		  const everyFields = Array.from(document.querySelectorAll("input"));
		  everyFields.forEach((field,index, fields)=>{
			  field.addEventListener('keydown', (event)=>{
				  smartInput(event,index, fields)
			  })
		  })
	  };

	  const smartInput = (event, fieldIndex, fields) => {
		 if(fieldIndex <= 4){
			 const commonKeys = ['Tab', 'Backspace', 'Delete', 'Shift', 'ArrowRight', 'ArrowLeft'];
			 let field = fields[fieldIndex];
			 if(fieldIndex < 3 && !commonKeys.includes(event.key)){
				 event.preventDefault();
				 if(!appState.cardDigits[fieldIndex]){
					 appState.cardDigits[fieldIndex] = [];
				 }
				 if(/\d/.test(event.key)){
					 field.value = `${field.value}${event.key}`;
					 appState.cardDigits[fieldIndex][field.value.length -1] =+event.key;
				 }
				 setTimeout(()=>{
					 field.value = '%'.repeat(field.value.length);
					 if(fieldIndex === 0 && field.value.length >= 4){
						 const first4Digits = appState.cardDigits[0];
						 detectCardType(first4Digits);
					 }
				 }, 500)
			 }
			 smartCursor(event, fieldIndex, fields);
		 }
		 
	  };

	  const uiCanInteract = () => {
		  
		  document.querySelectorAll('[data-cc-digits]>input')[1].focus();
		  const payBill = document.querySelector('[data-pay-btn]');
		  payBill.addEventListener('click', validatePayment);

		  billHype();
		  enableSmartTyping();
	  };

	  const displayCartTotal = ({ results }) => {
		  const [data] = results;
		  const {itemsInCart, buyerCountry} = data;
		  appState.items = itemsInCart;
		  appState.country = buyerCountry;
		  

		  appState.bill = itemsInCart.reduce((total, item) =>{return total +(item.price * item.qty)},0);
			 
		  appState.billFormatted = formatAsMoney(appState.bill, appState.country);

		  document.querySelector('[data-bill]').textContent = appState.billFormatted;
		  appState.cardDigits = [];
		  uiCanInteract();
	  };
      
	  const fetchBill = () => {
        const apiHost = 'https://randomapi.com/api';
		const apiKey = '006b08a801d82d0c9824dcfdfdfa3b3c';
		const apiEndpoint = `${apiHost}/${apiKey}`;

		fetch(apiEndpoint)
		.then(response => response.json())
		.then(data=>displayCartTotal(data))
		.catch(error => console.log('Error: ' + error));
        
      };
      
      const startApp = () => {
		  fetchBill();
      };

      startApp();